import mongoose from "mongoose";
import dns from "dns";
import { promisify } from "util";

const connectDB = async () => {
  try {
    // Configure DNS servers if specified
    if (process.env.DNS_SERVERS) {
      const servers = process.env.DNS_SERVERS.split(",").map((server) => server.trim());
      dns.setServers(servers);
      console.log(`Using DNS servers: ${servers.join(", ")}`);
    }

    // Test DNS resolution first
    const resolveSrv = promisify(dns.resolveSrv);
    try {
      console.log("Testing MongoDB SRV DNS resolution...");
      await resolveSrv("_mongodb._tcp.cluster0.fq5ee.mongodb.net");
      console.log("✓ DNS resolution successful");
    } catch (dnsError) {
      console.warn("⚠ DNS SRV lookup failed, but will continue:", dnsError.message);
    }

    const mongooseOptions = {
      retryWrites: true,
      w: "majority",
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 60000,
      authSource: "admin"
    };

    console.log("Connecting to MongoDB Atlas...");
    const conn = await mongoose.connect(process.env.MONGO_URI, mongooseOptions);

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:");
    console.error(`Error Code: ${error.code}`);
    console.error(`Error Message: ${error.message}`);
    
    if (error.code === "ETIMEOUT" || error.message.includes("ETIMEOUT")) {
      console.error("\n⚠ TIMEOUT ERROR - Possible causes:");
      console.error("1. MongoDB Atlas IP whitelist - Add your IP address");
      console.error("   Go to: https://cloud.mongodb.com/v2/ > Network Access > Add IP Address");
      console.error("2. Network connectivity issues - Check your internet connection");
      console.error("3. Firewall blocking DNS (port 53) - Check firewall settings");
      console.error("4. Wrong MongoDB URI - Verify connection string in .env");
    } else if (error.code === "ENOTFOUND") {
      console.error("\n⚠ DNS RESOLUTION ERROR:");
      console.error("1. Check internet connectivity");
      console.error("2. Try using different DNS servers in .env");
      console.error("3. Verify MongoDB URI is correct");
    } else if (error.code === "EAUTH") {
      console.error("\n⚠ AUTHENTICATION ERROR:");
      console.error("1. Check MongoDB username and password in .env");
      console.error("2. Verify credentials don't have special characters");
      console.error("3. Ensure user has database access");
    }

    console.error("\n📋 Current Configuration:");
    console.error(`MONGO_URI: ${process.env.MONGO_URI?.substring(0, 50)}...`);
    console.error(`DNS_SERVERS: ${process.env.DNS_SERVERS || "default"}`);

    throw error;
  }
};

export default connectDB;

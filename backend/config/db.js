import mongoose from "mongoose";
import dns from "dns";

const connectDB = async () => {
  try {
    if (process.env.DNS_SERVERS) {
      dns.setServers(process.env.DNS_SERVERS.split(",").map((server) => server.trim()));
    }

    const mongooseOptions = {
      retryWrites: true,
      w: "majority",
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, mongooseOptions);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Error:");
    console.error(error.message);
    console.error("\nTroubleshooting tips:");
    console.error("1. Check your MongoDB URI in .env file");
    console.error("2. Ensure MongoDB Atlas IP whitelist includes your IP");
    console.error("3. Verify credentials are correct");
    console.error("4. Check internet connectivity");

    throw error;
  }
};

export default connectDB;

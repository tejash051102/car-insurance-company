import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import customerPortalRoutes from "./routes/customerPortalRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import policyRoutes from "./routes/policyRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import intelligenceRoutes from "./routes/intelligenceRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import backupRoutes from "./routes/backupRoutes.js";
import garageRoutes from "./routes/garageRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";

import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { authRateLimit, securityHeaders } from "./middleware/securityMiddleware.js";

dotenv.config();

const startServer = async () => {
  try {
    console.log("Starting server...");
    await connectDB();

    const app = express();
    app.set("trust proxy", 1);
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const allowedOrigins = (
      process.env.CLIENT_URL ||
      "http://localhost:5173,http://127.0.0.1:5173,https://car-insurance-frontend-4x9z.onrender.com"
    )
      .split(",")
      .map((origin) => origin.trim().replace(/\/+$/, ""))
      .filter(Boolean);
    const isRenderOrigin = (origin = "") => /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin);
    const corsOptions = {
      origin(origin, callback) {
        const normalizedOrigin = origin?.replace(/\/+$/, "");

        if (!origin || allowedOrigins.includes(normalizedOrigin) || isRenderOrigin(normalizedOrigin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`CORS blocked origin: ${origin}`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      optionsSuccessStatus: 204
    };

    app.use(cors(corsOptions));
    app.options("*", cors(corsOptions));

    app.use(securityHeaders);
    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: true, limit: "1mb" }));

    if (process.env.NODE_ENV === "development") {
      app.use(morgan("dev"));
    }

    app.get("/", (req, res) => {
      res.json({
        message: "API Running Successfully",
      });
    });

    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    app.use("/api/auth", authRateLimit, authRoutes);
    app.use("/api/customers", customerRoutes);
    app.use("/api/customer-portal", customerPortalRoutes);
    app.use("/api/vehicles", vehicleRoutes);
    app.use("/api/policies", policyRoutes);
    app.use("/api/claims", claimRoutes);
    app.use("/api/payments", paymentRoutes);
    app.use("/api/dashboard", dashboardRoutes);
    app.use("/api/activities", activityRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/security", securityRoutes);
    app.use("/api/intelligence", intelligenceRoutes);
    app.use("/api/tickets", ticketRoutes);
    app.use("/api/notifications", notificationRoutes);
    app.use("/api/reports", reportRoutes);
    app.use("/api/backups", backupRoutes);
    app.use("/api/garages", garageRoutes);
    app.use("/api/services", serviceRoutes);

    app.use("/auth", authRateLimit, authRoutes);
    app.use("/customers", customerRoutes);
    app.use("/customer-portal", customerPortalRoutes);
    app.use("/vehicles", vehicleRoutes);
    app.use("/policies", policyRoutes);
    app.use("/claims", claimRoutes);
    app.use("/payments", paymentRoutes);
    app.use("/dashboard", dashboardRoutes);
    app.use("/activities", activityRoutes);
    app.use("/users", userRoutes);
    app.use("/security", securityRoutes);
    app.use("/intelligence", intelligenceRoutes);
    app.use("/tickets", ticketRoutes);
    app.use("/notifications", notificationRoutes);
    app.use("/reports", reportRoutes);
    app.use("/backups", backupRoutes);
    app.use("/garages", garageRoutes);
    app.use("/services", serviceRoutes);

    app.use(notFound);
    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. The backend may already be running.`);
        console.error(`Open http://127.0.0.1:${PORT} to check it, or stop the existing Node process before starting another one.`);
        process.exit(1);
      }

      console.error("SERVER LISTEN FAILED");
      console.error(error);
      process.exit(1);
    });
  } catch (error) {
    console.error("SERVER START FAILED");
    console.error(error);
    process.exit(1);
  }
};

startServer();

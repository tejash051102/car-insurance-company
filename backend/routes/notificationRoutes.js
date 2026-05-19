import express from "express";
import {
  createNotification,
  getNotifications,
  markNotificationRead
} from "../controllers/notificationController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.post("/", protect, authorize("admin", "manager"), createNotification);
router.patch("/:id/read", protect, markNotificationRead);

export default router;

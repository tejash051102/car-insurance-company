import express from "express";
import { getActivityLogs } from "../controllers/activityController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin", "manager"), getActivityLogs);

export default router;

import express from "express";
import { downloadReport, getReportsOverview } from "../controllers/reportController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin", "manager"), getReportsOverview);
router.get("/:type/pdf", protect, authorize("admin", "manager"), downloadReport);

export default router;

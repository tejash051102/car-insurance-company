import express from "express";
import {
  getClaimRiskScore,
  getIntelligenceOverview,
  getPolicyRecommendations
} from "../controllers/intelligenceController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin", "manager"), getIntelligenceOverview);
router.get("/claims/:id/risk", protect, authorize("admin", "manager"), getClaimRiskScore);
router.get("/recommendations", protect, getPolicyRecommendations);

export default router;

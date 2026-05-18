import express from "express";
import {
  getLoginHistory,
  getRbacReport,
  getSecurityAlerts,
  getSecurityOverview
} from "../controllers/securityController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/overview", protect, authorize("admin", "manager"), getSecurityOverview);
router.get("/login-history", protect, authorize("admin", "manager"), getLoginHistory);
router.get("/alerts", protect, authorize("admin", "manager"), getSecurityAlerts);
router.get("/rbac-report", protect, authorize("admin", "manager"), getRbacReport);

export default router;

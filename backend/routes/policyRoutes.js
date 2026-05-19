import express from "express";
import {
  createPolicy,
  deletePolicy,
  downloadPolicyPdf,
  getExpiringPolicies,
  getPolicies,
  getPolicyById,
  sendPolicyExpiryReminders,
  updatePolicy
} from "../controllers/policyController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getPolicies).post(protect, createPolicy);
router.get("/expiring", protect, getExpiringPolicies);
router.post("/expiry-reminders", protect, admin, sendPolicyExpiryReminders);
router.get("/:id/pdf", protect, downloadPolicyPdf);
router.route("/:id").get(protect, getPolicyById).put(protect, updatePolicy).delete(protect, admin, deletePolicy);

export default router;

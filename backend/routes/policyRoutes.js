import express from "express";
import {
  approvePolicy,
  calculatePolicyPremium,
  cancelPolicy,
  createPolicy,
  deletePolicy,
  downloadPolicyPdf,
  downloadQuotationPdf,
  exportPolicies,
  getExpiringPolicies,
  getPolicies,
  getPolicyById,
  sendPolicyExpiryReminders,
  renewPolicy,
  updatePolicy
} from "../controllers/policyController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getPolicies).post(protect, createPolicy);
router.get("/export/csv", protect, authorize("admin", "manager"), exportPolicies);
router.get("/expiring", protect, getExpiringPolicies);
router.post("/premium/calculate", protect, calculatePolicyPremium);
router.post("/quotation/pdf", protect, downloadQuotationPdf);
router.post("/expiry-reminders", protect, authorize("admin", "manager"), sendPolicyExpiryReminders);
router.get("/:id/pdf", protect, downloadPolicyPdf);
router.patch("/:id/approval", protect, authorize("admin"), approvePolicy);
router.post("/:id/renew", protect, authorize("admin", "manager"), renewPolicy);
router.patch("/:id/cancel", protect, authorize("admin", "manager"), cancelPolicy);
router
  .route("/:id")
  .get(protect, getPolicyById)
  .put(protect, updatePolicy)
  .delete(protect, authorize("admin", "manager"), deletePolicy);

export default router;

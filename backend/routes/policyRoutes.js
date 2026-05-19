import express from "express";
import {
  approvePolicy,
  createPolicy,
  deletePolicy,
  downloadPolicyPdf,
<<<<<<< HEAD
=======
  exportPolicies,
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b
  getExpiringPolicies,
  getPolicies,
  getPolicyById,
  sendPolicyExpiryReminders,
  updatePolicy
} from "../controllers/policyController.js";
<<<<<<< HEAD
import { admin, protect } from "../middleware/authMiddleware.js";
=======
import { authorize, protect } from "../middleware/authMiddleware.js";
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b

const router = express.Router();

router.route("/").get(protect, getPolicies).post(protect, createPolicy);
<<<<<<< HEAD
router.get("/expiring", protect, getExpiringPolicies);
router.post("/expiry-reminders", protect, admin, sendPolicyExpiryReminders);
router.get("/:id/pdf", protect, downloadPolicyPdf);
router.route("/:id").get(protect, getPolicyById).put(protect, updatePolicy).delete(protect, admin, deletePolicy);
=======
router.get("/export/csv", protect, authorize("admin", "manager"), exportPolicies);
router.get("/expiring", protect, getExpiringPolicies);
router.post("/expiry-reminders", protect, authorize("admin", "manager"), sendPolicyExpiryReminders);
router.get("/:id/pdf", protect, downloadPolicyPdf);
router.patch("/:id/approval", protect, authorize("admin"), approvePolicy);
router
  .route("/:id")
  .get(protect, getPolicyById)
  .put(protect, updatePolicy)
  .delete(protect, authorize("admin", "manager"), deletePolicy);
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b

export default router;

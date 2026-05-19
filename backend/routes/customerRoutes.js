import express from "express";
import {
  createCustomer,
  deleteCustomer,
  exportCustomers,
  getCustomerById,
  getCustomers,
  resendCustomerOtp,
  updateCustomer,
  updateDocumentVerification,
  uploadCustomerDocuments,
  verifyCustomerOtp
} from "../controllers/customerController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getCustomers).post(protect, createCustomer);
router.get("/export/csv", protect, authorize("admin", "manager"), exportCustomers);
router.post("/:id/documents", protect, upload.array("documents", 5), uploadCustomerDocuments);
router.patch("/:id/documents/:documentId/verification", protect, authorize("admin", "manager"), updateDocumentVerification);
router.post("/:id/send-otp", protect, resendCustomerOtp);
router.post("/:id/verify-otp", protect, verifyCustomerOtp);
router
  .route("/:id")
  .get(protect, getCustomerById)
  .put(protect, updateCustomer)
  .delete(protect, authorize("admin", "manager"), deleteCustomer);

export default router;

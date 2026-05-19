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
<<<<<<< HEAD
import { admin, protect } from "../middleware/authMiddleware.js";
=======
import { authorize, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b

const router = express.Router();

router.route("/").get(protect, getCustomers).post(protect, createCustomer);
<<<<<<< HEAD
router.route("/:id").get(protect, getCustomerById).put(protect, updateCustomer).delete(protect, admin, deleteCustomer);
=======
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
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b

export default router;

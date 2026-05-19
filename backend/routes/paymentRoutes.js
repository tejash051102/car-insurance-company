import express from "express";
import {
  createPayment,
  deletePayment,
  downloadPaymentInvoice,
<<<<<<< HEAD
=======
  exportPayments,
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b
  getPaymentById,
  getPayments,
  updatePayment
} from "../controllers/paymentController.js";
<<<<<<< HEAD
import { admin, protect } from "../middleware/authMiddleware.js";
=======
import { authorize, protect } from "../middleware/authMiddleware.js";
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b

const router = express.Router();

router.route("/").get(protect, getPayments).post(protect, createPayment);
<<<<<<< HEAD
router.get("/:id/invoice", protect, downloadPaymentInvoice);
router.route("/:id").get(protect, getPaymentById).put(protect, updatePayment).delete(protect, admin, deletePayment);
=======
router.get("/export/csv", protect, authorize("admin", "manager"), exportPayments);
router.get("/:id/invoice", protect, downloadPaymentInvoice);
router
  .route("/:id")
  .get(protect, getPaymentById)
  .put(protect, updatePayment)
  .delete(protect, authorize("admin", "manager"), deletePayment);
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b

export default router;

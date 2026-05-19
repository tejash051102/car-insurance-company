import express from "express";
import {
  createPayment,
  deletePayment,
  downloadPaymentInvoice,
  exportPayments,
  getPaymentById,
  getPayments,
  updatePayment
} from "../controllers/paymentController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getPayments).post(protect, createPayment);
router.get("/export/csv", protect, authorize("admin", "manager"), exportPayments);
router.get("/:id/invoice", protect, downloadPaymentInvoice);
router
  .route("/:id")
  .get(protect, getPaymentById)
  .put(protect, updatePayment)
  .delete(protect, authorize("admin", "manager"), deletePayment);

export default router;

import express from "express";
import {
  createPayment,
  deletePayment,
  downloadPaymentInvoice,
  getPaymentById,
  getPayments,
  updatePayment
} from "../controllers/paymentController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getPayments).post(protect, createPayment);
router.get("/:id/invoice", protect, downloadPaymentInvoice);
router.route("/:id").get(protect, getPaymentById).put(protect, updatePayment).delete(protect, admin, deletePayment);

export default router;

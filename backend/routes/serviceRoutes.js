import express from "express";
import {
  addThreadMessage,
  createFeedback,
  createMessageThread,
  createPaymentPlan,
  getFeedback,
  getMessageThreads,
  getPaymentPlans,
  getTimeline,
  markInstallmentPaid
} from "../controllers/serviceController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/payment-plans").get(protect, getPaymentPlans).post(protect, authorize("admin", "manager"), createPaymentPlan);
router.patch("/payment-plans/:id/installments/:installmentId/pay", protect, markInstallmentPaid);
router.route("/feedback").get(protect, getFeedback).post(protect, createFeedback);
router.route("/messages").get(protect, getMessageThreads).post(protect, createMessageThread);
router.post("/messages/:id", protect, addThreadMessage);
router.get("/timeline/:id", protect, getTimeline);

export default router;

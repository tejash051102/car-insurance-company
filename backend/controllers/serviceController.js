import asyncHandler from "express-async-handler";
import ActivityLog from "../models/ActivityLog.js";
import Claim from "../models/Claim.js";
import Feedback from "../models/Feedback.js";
import MessageThread from "../models/MessageThread.js";
import Payment from "../models/Payment.js";
import PaymentPlan from "../models/PaymentPlan.js";
import Policy from "../models/Policy.js";

const buildInstallments = ({ totalAmount, count, startDate, frequency }) => {
  const amount = Math.round(Number(totalAmount || 0) / count);
  const start = startDate ? new Date(startDate) : new Date();
  return Array.from({ length: count }, (_, index) => {
    const dueDate = new Date(start);
    dueDate.setMonth(start.getMonth() + index * (frequency === "quarterly" ? 3 : 1));
    return { dueDate, amount };
  });
};

export const getPaymentPlans = asyncHandler(async (_req, res) => {
  res.json(await PaymentPlan.find().populate("customer").populate("policy").sort({ createdAt: -1 }));
});

export const createPaymentPlan = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.body.policy);
  if (!policy) {
    res.status(404);
    throw new Error("Policy not found");
  }

  const frequency = req.body.frequency || "monthly";
  const count = Number(req.body.installmentCount || (frequency === "quarterly" ? 4 : 12));
  const totalAmount = Number(req.body.totalAmount || policy.premiumAmount);

  const plan = await PaymentPlan.create({
    policy: policy._id,
    customer: policy.customer,
    frequency,
    totalAmount,
    installments: buildInstallments({ totalAmount, count, startDate: req.body.startDate, frequency })
  });

  res.status(201).json(await plan.populate(["customer", "policy"]));
});

export const markInstallmentPaid = asyncHandler(async (req, res) => {
  const plan = await PaymentPlan.findById(req.params.id);
  if (!plan) {
    res.status(404);
    throw new Error("Payment plan not found");
  }
  const installment = plan.installments.id(req.params.installmentId);
  if (!installment) {
    res.status(404);
    throw new Error("Installment not found");
  }

  const payment = await Payment.create({
    policy: plan.policy,
    customer: plan.customer,
    amount: installment.amount,
    method: req.body.method || "upi",
    status: "paid",
    paymentNumber: `PAY-${Date.now().toString().slice(-8)}`,
    receiptIssuedAt: new Date(),
    notes: "EMI installment payment"
  });

  installment.status = "paid";
  installment.paidAt = new Date();
  installment.payment = payment._id;
  if (plan.installments.every((item) => item.status === "paid")) {
    plan.status = "completed";
  }
  await plan.save();

  res.json(await plan.populate(["customer", "policy"]));
});

export const getFeedback = asyncHandler(async (_req, res) => {
  res.json(await Feedback.find().populate("customer").populate("claim").populate("policy").sort({ createdAt: -1 }));
});

export const createFeedback = asyncHandler(async (req, res) => {
  res.status(201).json(await Feedback.create(req.body));
});

export const getMessageThreads = asyncHandler(async (_req, res) => {
  res.json(await MessageThread.find().populate("customer").populate("assignedTo", "name email role").sort({ updatedAt: -1 }));
});

export const createMessageThread = asyncHandler(async (req, res) => {
  const thread = await MessageThread.create({
    ...req.body,
    messages: [
      {
        senderType: "user",
        senderName: req.user?.name || "Staff",
        body: req.body.message || "Thread started"
      }
    ]
  });
  res.status(201).json(await thread.populate(["customer", "assignedTo"]));
});

export const addThreadMessage = asyncHandler(async (req, res) => {
  if (!req.body.body?.trim()) {
    res.status(400);
    throw new Error("Message body is required");
  }

  const thread = await MessageThread.findById(req.params.id);
  if (!thread) {
    res.status(404);
    throw new Error("Message thread not found");
  }
  thread.messages.push({
    senderType: req.body.senderType || "user",
    senderName: req.body.senderName || req.user?.name || "Staff",
    body: req.body.body
  });
  await thread.save();
  res.json(await thread.populate(["customer", "assignedTo"]));
});

export const getTimeline = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find({
    entityId: req.params.id
  }).sort({ createdAt: -1 });
  res.json(logs);
});

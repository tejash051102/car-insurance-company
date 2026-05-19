import asyncHandler from "express-async-handler";
import Claim from "../models/Claim.js";
import Notification from "../models/Notification.js";
import Payment from "../models/Payment.js";
import Policy from "../models/Policy.js";
import SecurityAlert from "../models/SecurityAlert.js";

const generateSystemNotifications = async () => {
  const now = new Date();
  const next30 = new Date();
  next30.setDate(now.getDate() + 30);

  const [expiringPolicies, duePayments, pendingClaims, alerts] = await Promise.all([
    Policy.find({ status: { $in: ["active", "pending"] }, endDate: { $gte: now, $lte: next30 } }).limit(8),
    Payment.find({ status: { $in: ["pending", "failed"] } }).populate("customer").limit(8),
    Claim.find({ status: { $in: ["submitted", "under-review"] } }).populate("customer").limit(8),
    SecurityAlert.find({ resolved: false }).sort({ createdAt: -1 }).limit(8)
  ]);

  return [
    ...expiringPolicies.map((policy) => ({
      _id: `policy-${policy._id}`,
      title: "Policy expiry reminder",
      message: `${policy.policyNumber} expires on ${policy.endDate?.toISOString().slice(0, 10)}`,
      type: "policy",
      severity: "warning",
      createdAt: policy.endDate
    })),
    ...duePayments.map((payment) => ({
      _id: `payment-${payment._id}`,
      title: "Payment attention needed",
      message: `${payment.paymentNumber} is ${payment.status}`,
      type: "payment",
      severity: payment.status === "failed" ? "critical" : "warning",
      createdAt: payment.paymentDate
    })),
    ...pendingClaims.map((claim) => ({
      _id: `claim-${claim._id}`,
      title: "Claim awaiting review",
      message: `${claim.claimNumber} is ${claim.status}`,
      type: "claim",
      severity: "info",
      createdAt: claim.createdAt
    })),
    ...alerts.map((alert) => ({
      _id: `alert-${alert._id}`,
      title: "Security alert",
      message: alert.message,
      type: "security",
      severity: alert.severity === "critical" ? "critical" : "warning",
      createdAt: alert.createdAt
    }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getNotifications = asyncHandler(async (_req, res) => {
  const [saved, generated] = await Promise.all([
    Notification.find({ audience: { $in: ["staff", "all"] } }).sort({ createdAt: -1 }).limit(50),
    generateSystemNotifications()
  ]);

  res.json({
    saved,
    generated,
    unread: saved.filter((notification) => !notification.read).length + generated.length
  });
});

export const createNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create({
    ...req.body,
    audience: req.body.audience || "staff"
  });

  res.status(201).json(notification);
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  res.json(notification);
});

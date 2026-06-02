import asyncHandler from "express-async-handler";
import Policy from "../models/Policy.js";
import Claim from "../models/Claim.js";
import Payment from "../models/Payment.js";
import { logActivity } from "../utils/activityLogger.js";
import { buildPolicyExpiryMessage, sendEmail } from "../utils/emailService.js";
import { sendCsv } from "../utils/csvExporter.js";
import { getPagination, sendPaginated } from "../utils/pagination.js";
import { calculatePremium } from "../utils/premiumCalculator.js";
import { createPolicyPdf, createQuotationPdf } from "../utils/pdfGenerator.js";

const generatePolicyNumber = () => `POL-${Date.now().toString().slice(-8)}`;

export const getPolicies = asyncHandler(async (req, res) => {
  const filter = {
    ...(req.query.status ? { status: req.query.status } : {}),
    ...(req.query.search
      ? {
          $or: [
            { policyNumber: { $regex: req.query.search, $options: "i" } },
            { type: { $regex: req.query.search, $options: "i" } },
            { status: { $regex: req.query.search, $options: "i" } }
          ]
        }
      : {})
  };
  const { page, limit, skip } = getPagination(req.query);

  await sendPaginated(
    res,
    Policy.find(filter).populate("customer").populate("vehicle").sort({ createdAt: -1 }),
    Policy.countDocuments(filter),
    { page, limit, skip }
  );
});

export const getExpiringPolicies = asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
  const now = new Date();
  const until = new Date();
  until.setDate(now.getDate() + days);

  const policies = await Policy.find({
    status: { $in: ["active", "pending"] },
    endDate: { $gte: now, $lte: until }
  })
    .populate("customer")
    .populate("vehicle")
    .sort({ endDate: 1 });

  res.json(policies);
});

export const sendPolicyExpiryReminders = asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(Number(req.body.days || req.query.days) || 30, 1), 365);
  const now = new Date();
  const until = new Date();
  until.setDate(now.getDate() + days);

  const policies = await Policy.find({
    status: { $in: ["active", "pending"] },
    endDate: { $gte: now, $lte: until }
  }).populate("customer");

  const results = await Promise.all(
    policies.map((policy) => sendEmail(buildPolicyExpiryMessage(policy)))
  );

  res.json({
    message: "Policy expiry reminders processed",
    count: policies.length,
    sent: results.filter((result) => !result?.skipped).length,
    skipped: results.filter((result) => result?.skipped).length
  });
});

export const getPolicyById = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.params.id).populate("customer").populate("vehicle");

  if (!policy) {
    res.status(404);
    throw new Error("Policy not found");
  }

  res.json(policy);
});

export const exportPolicies = asyncHandler(async (req, res) => {
  const policies = await Policy.find().populate("customer").populate("vehicle").sort({ createdAt: -1 });

  sendCsv(
    res,
    "policies.csv",
    [
      { label: "Policy Number", value: (policy) => policy.policyNumber },
      { label: "Customer", value: (policy) => policy.customer?.fullName },
      { label: "Vehicle", value: (policy) => policy.vehicle?.registrationNumber },
      { label: "Type", value: (policy) => policy.type },
      { label: "Premium", value: (policy) => policy.premiumAmount },
      { label: "Coverage", value: (policy) => policy.coverageAmount },
      { label: "Start Date", value: (policy) => policy.startDate?.toISOString().slice(0, 10) },
      { label: "End Date", value: (policy) => policy.endDate?.toISOString().slice(0, 10) },
      { label: "Status", value: (policy) => policy.status }
    ],
    policies
  );
});

export const createPolicy = asyncHandler(async (req, res) => {
  const addOnPremium = (req.body.addOns || []).reduce((sum, addOn) => sum + Number(addOn.premium || 0), 0);
  const policy = await Policy.create({
    ...req.body,
    premiumAmount: Number(req.body.premiumAmount || 0) + addOnPremium,
    policyNumber: req.body.policyNumber || generatePolicyNumber(),
    approvalStatus: req.user?.role === "admin" ? "approved" : "pending",
    approvedBy: req.user?.role === "admin" ? req.user._id : undefined,
    approvedAt: req.user?.role === "admin" ? new Date() : undefined
  });

  const populatedPolicy = await policy.populate(["customer", "vehicle"]);
  res.status(201).json(populatedPolicy);
});

export const calculatePolicyPremium = asyncHandler(async (req, res) => {
  res.json(calculatePremium(req.body));
});

export const downloadQuotationPdf = asyncHandler(async (req, res) => {
  const quote = {
    ...req.body,
    ...calculatePremium(req.body)
  };

  const pdfBuffer = await createQuotationPdf(quote);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=insurance-quotation.pdf");
  res.send(pdfBuffer);
});

export const renewPolicy = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.params.id).populate("customer").populate("vehicle");

  if (!policy) {
    res.status(404);
    throw new Error("Policy not found");
  }

  const startDate = req.body.startDate ? new Date(req.body.startDate) : new Date(policy.endDate);
  startDate.setDate(startDate.getDate() + 1);
  const endDate = req.body.endDate ? new Date(req.body.endDate) : new Date(startDate);
  if (!req.body.endDate) endDate.setFullYear(endDate.getFullYear() + 1);

  const previousClaims = await Claim.countDocuments({ policy: policy._id });
  const noClaimBonusPercent = previousClaims === 0 ? Number(req.body.noClaimBonusPercent ?? 20) : 0;
  const basePremium = Number(req.body.premiumAmount || policy.premiumAmount);
  const discountedPremium = Math.max(Math.round(basePremium * (1 - noClaimBonusPercent / 100)), 0);

  const renewal = await Policy.create({
    customer: policy.customer._id,
    vehicle: policy.vehicle._id,
    type: req.body.type || policy.type,
    coverageAmount: Number(req.body.coverageAmount || policy.coverageAmount),
    premiumAmount: discountedPremium,
    startDate,
    endDate,
    status: "active",
    approvalStatus: "approved",
    approvedBy: req.user?._id,
    approvedAt: new Date(),
    assignedAgent: req.body.assignedAgent || policy.assignedAgent,
    addOns: req.body.addOns || policy.addOns,
    noClaimBonusPercent,
    renewalOf: policy._id,
    policyNumber: req.body.policyNumber || generatePolicyNumber(),
    notes: req.body.notes || `Renewal of ${policy.policyNumber}`
  });

  policy.renewalHistory.push({
    renewedPolicy: renewal._id,
    oldEndDate: policy.endDate,
    newStartDate: startDate,
    newEndDate: endDate,
    premiumAmount: renewal.premiumAmount,
    noClaimBonusPercent,
    renewedBy: req.user?._id
  });
  policy.status = "expired";
  await policy.save();

  const populatedRenewal = await renewal.populate(["customer", "vehicle", "assignedAgent"]);
  res.status(201).json(populatedRenewal);
});

export const cancelPolicy = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.params.id).populate("customer").populate("vehicle");

  if (!policy) {
    res.status(404);
    throw new Error("Policy not found");
  }

  const now = new Date();
  const start = new Date(policy.startDate);
  const end = new Date(policy.endDate);
  const totalDays = Math.max((end - start) / 86400000, 1);
  const remainingDays = Math.max((end - now) / 86400000, 0);
  const refundAmount = Math.round(Number(policy.premiumAmount || 0) * (remainingDays / totalDays) * 0.85);

  policy.status = "cancelled";
  policy.cancellation = {
    reason: req.body.reason || "Cancelled by insurance team",
    refundAmount,
    cancelledBy: req.user?._id,
    cancelledAt: now
  };
  await policy.save();

  await logActivity({
    req,
    action: "cancelled",
    entityType: "Policy",
    entityId: policy._id,
    message: `Cancelled policy ${policy.policyNumber}; refund ${refundAmount}`
  });

  res.json(policy);
});

export const approvePolicy = asyncHandler(async (req, res) => {
  const { approvalStatus, approvalNote } = req.body;

  if (!["approved", "rejected", "pending"].includes(approvalStatus)) {
    res.status(400);
    throw new Error("Invalid policy approval status");
  }

  const policy = await Policy.findByIdAndUpdate(
    req.params.id,
    {
      approvalStatus,
      approvalNote,
      approvedBy: req.user?._id,
      approvedAt: new Date(),
      ...(approvalStatus === "approved" ? { status: "active" } : {})
    },
    { new: true, runValidators: true }
  )
    .populate("customer")
    .populate("vehicle")
    .populate("approvedBy", "name email role");

  if (!policy) {
    res.status(404);
    throw new Error("Policy not found");
  }

  res.json(policy);
});

export const updatePolicy = asyncHandler(async (req, res) => {
  const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate("customer")
    .populate("vehicle");

  if (!policy) {
    res.status(404);
    throw new Error("Policy not found");
  }

  res.json(policy);
});

export const deletePolicy = asyncHandler(async (req, res) => {
  const [claimCount, paymentCount] = await Promise.all([
    Claim.countDocuments({ policy: req.params.id }),
    Payment.countDocuments({ policy: req.params.id })
  ]);

  if (claimCount || paymentCount) {
    res.status(400);
    throw new Error("Cannot delete a policy with linked claims or payments");
  }

  const policy = await Policy.findByIdAndDelete(req.params.id);

  if (!policy) {
    res.status(404);
    throw new Error("Policy not found");
  }

  res.json({ message: "Policy deleted successfully" });
});

export const downloadPolicyPdf = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.params.id).populate("customer").populate("vehicle");

  if (!policy) {
    res.status(404);
    throw new Error("Policy not found");
  }

  const pdfBuffer = await createPolicyPdf(policy);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${policy.policyNumber}.pdf`);
  res.send(pdfBuffer);
});

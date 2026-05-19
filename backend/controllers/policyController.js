import asyncHandler from "express-async-handler";
import Policy from "../models/Policy.js";
import Claim from "../models/Claim.js";
import Payment from "../models/Payment.js";
import { buildPolicyExpiryMessage, sendEmail } from "../utils/emailService.js";
import { getPagination, sendPaginated } from "../utils/pagination.js";
import { createPolicyPdf } from "../utils/pdfGenerator.js";

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

export const createPolicy = asyncHandler(async (req, res) => {
  const policy = await Policy.create({
    ...req.body,
    policyNumber: req.body.policyNumber || generatePolicyNumber()
  });

  const populatedPolicy = await policy.populate(["customer", "vehicle"]);
  res.status(201).json(populatedPolicy);
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

import asyncHandler from "express-async-handler";
import Claim from "../models/Claim.js";
import Policy from "../models/Policy.js";
<<<<<<< HEAD
=======
import { sendCsv } from "../utils/csvExporter.js";
import { logActivity } from "../utils/activityLogger.js";
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b
import { getPagination, sendPaginated } from "../utils/pagination.js";

const generateClaimNumber = () => `CLM-${Date.now().toString().slice(-8)}`;

<<<<<<< HEAD
const allowedTransitions = {
  submitted: ["under-review", "rejected"],
  "under-review": ["approved", "rejected"],
  approved: ["settled"],
  rejected: [],
  settled: []
};

export const getClaims = asyncHandler(async (req, res) => {
  const filter = {
    ...(req.query.status ? { status: req.query.status } : {}),
    ...(req.query.search
      ? {
          $or: [
            { claimNumber: { $regex: req.query.search, $options: "i" } },
            { status: { $regex: req.query.search, $options: "i" } },
            { description: { $regex: req.query.search, $options: "i" } }
          ]
        }
      : {})
  };
  const { page, limit, skip } = getPagination(req.query);

=======
export const getClaims = asyncHandler(async (req, res) => {
  const filter = {
    ...(req.query.status ? { status: req.query.status } : {}),
    ...(req.query.search
      ? {
          $or: [
            { claimNumber: { $regex: req.query.search, $options: "i" } },
            { status: { $regex: req.query.search, $options: "i" } },
            { description: { $regex: req.query.search, $options: "i" } }
          ]
        }
      : {})
  };
  const { page, limit, skip } = getPagination(req.query);

>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b
  await sendPaginated(
    res,
    Claim.find(filter)
      .populate("customer")
      .populate({
        path: "policy",
        populate: { path: "vehicle" }
      })
      .sort({ createdAt: -1 }),
    Claim.countDocuments(filter),
    { page, limit, skip }
  );
});

export const getClaimById = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id).populate("customer").populate("policy");

  if (!claim) {
    res.status(404);
    throw new Error("Claim not found");
  }

  res.json(claim);
});

export const exportClaims = asyncHandler(async (req, res) => {
  const claims = await Claim.find().populate("customer").populate("policy").sort({ createdAt: -1 });

  sendCsv(
    res,
    "claims.csv",
    [
      { label: "Claim Number", value: (claim) => claim.claimNumber },
      { label: "Policy", value: (claim) => claim.policy?.policyNumber },
      { label: "Customer", value: (claim) => claim.customer?.fullName },
      { label: "Incident Date", value: (claim) => claim.incidentDate?.toISOString().slice(0, 10) },
      { label: "Claim Amount", value: (claim) => claim.claimAmount },
      { label: "Approved Amount", value: (claim) => claim.approvedAmount },
      { label: "Status", value: (claim) => claim.status }
    ],
    claims
  );
});

export const createClaim = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.body.policy);

  if (!policy) {
    res.status(404);
    throw new Error("Policy not found");
  }

  const claim = await Claim.create({
    ...req.body,
    customer: req.body.customer || policy.customer,
    claimNumber: req.body.claimNumber || generateClaimNumber(),
    documentUrl: req.file ? `/uploads/${req.file.filename}` : req.body.documentUrl
  });

  const populatedClaim = await claim.populate(["customer", "policy"]);
  await logActivity({
    req,
    action: "created",
    entityType: "Claim",
    entityId: claim._id,
    message: `Created claim ${claim.claimNumber}`
  });

  res.status(201).json(populatedClaim);
});

export const updateClaim = asyncHandler(async (req, res) => {
  const update = {
    ...req.body,
    ...(req.file ? { documentUrl: `/uploads/${req.file.filename}` } : {})
  };

  const claim = await Claim.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true
  })
    .populate("customer")
    .populate("policy");

  if (!claim) {
    res.status(404);
    throw new Error("Claim not found");
  }

  await logActivity({
    req,
    action: "updated",
    entityType: "Claim",
    entityId: claim._id,
    message: `Updated claim ${claim.claimNumber}`
  });

  res.json(claim);
});

export const decideClaim = asyncHandler(async (req, res) => {
  const { status, approvedAmount, decisionNote } = req.body;
  const allowedStatuses = ["under-review", "approved", "rejected", "settled"];

  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid claim decision status");
  }

  const claim = await Claim.findByIdAndUpdate(
    req.params.id,
    {
      status,
      approvedAmount: Number(approvedAmount || 0),
      decisionNote,
      decidedBy: req.user?._id,
      decidedAt: new Date()
    },
    { new: true, runValidators: true }
  )
    .populate("customer")
    .populate("policy")
    .populate("decidedBy", "name email role");

  if (!claim) {
    res.status(404);
    throw new Error("Claim not found");
  }

  await logActivity({
    req,
    action: status,
    entityType: "Claim",
    entityId: claim._id,
    message: `Marked claim ${claim.claimNumber} as ${status}`
  });

  res.json(claim);
});

export const updateClaimStatus = asyncHandler(async (req, res) => {
  const { status, approvedAmount } = req.body;
  const claim = await Claim.findById(req.params.id);

  if (!claim) {
    res.status(404);
    throw new Error("Claim not found");
  }

  if (!allowedTransitions[claim.status]?.includes(status)) {
    res.status(400);
    throw new Error(`Cannot move claim from ${claim.status} to ${status}`);
  }

  claim.status = status;

  if (status === "approved" && approvedAmount !== undefined) {
    claim.approvedAmount = Number(approvedAmount);
  }

  const updatedClaim = await claim.save();
  await updatedClaim.populate(["customer", "policy"]);

  res.json(updatedClaim);
});

export const deleteClaim = asyncHandler(async (req, res) => {
  const claim = await Claim.findByIdAndDelete(req.params.id);

  if (!claim) {
    res.status(404);
    throw new Error("Claim not found");
  }

  await logActivity({
    req,
    action: "deleted",
    entityType: "Claim",
    entityId: claim._id,
    message: `Deleted claim ${claim.claimNumber}`
  });

  res.json({ message: "Claim deleted successfully" });
});

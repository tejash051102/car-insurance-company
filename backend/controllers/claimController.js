import asyncHandler from "express-async-handler";
import Claim from "../models/Claim.js";
import Policy from "../models/Policy.js";
import { logActivity } from "../utils/activityLogger.js";
import { sendCsv } from "../utils/csvExporter.js";
import { buildClaimStatusMessage, sendEmail } from "../utils/emailService.js";
import { getPagination, sendPaginated } from "../utils/pagination.js";
import { calculateClaimRisk } from "../utils/riskScoring.js";

const generateClaimNumber = () => `CLM-${Date.now().toString().slice(-8)}`;
const workflowStatuses = ["submitted", "under-review", "survey-scheduled", "approved", "rejected", "paid", "settled"];

const flattenFiles = (files) => {
  if (!files) return [];
  if (Array.isArray(files)) return files;
  return Object.values(files).flat();
};

const filesToDocuments = (files = []) =>
  flattenFiles(files).map((file) => ({
    label: file.fieldname === "accidentPhotos" ? "Accident photo" : file.fieldname === "repairBills" ? "Repair bill" : file.fieldname === "firReports" ? "FIR/report" : "Claim evidence",
    url: `/uploads/${file.filename}`,
    originalName: file.originalname
  }));

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

  await sendPaginated(
    res,
    Claim.find(filter)
      .populate("customer")
      .populate({
        path: "policy",
        populate: { path: "vehicle" }
      })
      .populate("assignedAgent", "name email role")
      .populate("inspection.inspector", "name email role")
      .sort({ createdAt: -1 }),
    Claim.countDocuments(filter),
    { page, limit, skip }
  );
});

export const getClaimById = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id)
    .populate("customer")
    .populate("policy")
    .populate("assignedAgent", "name email role")
    .populate("inspection.inspector", "name email role");

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
    documentUrl: req.file ? `/uploads/${req.file.filename}` : req.body.documentUrl,
    documents: filesToDocuments(req.files || req.file)
  });

  const risk = await calculateClaimRisk(claim);
  claim.fraud = {
    score: risk.score,
    level: risk.level,
    reasons: risk.reasons,
    calculatedAt: new Date()
  };
  await claim.save();

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

  const existingClaim = await Claim.findById(req.params.id);

  if (!existingClaim) {
    res.status(404);
    throw new Error("Claim not found");
  }

  const newDocuments = filesToDocuments(req.files || req.file);
  if (newDocuments.length) {
    update.documents = [...(existingClaim.documents || []), ...newDocuments];
  }

  const claim = await Claim.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true
  })
    .populate("customer")
    .populate("policy")
    .populate("assignedAgent", "name email role")
    .populate("inspection.inspector", "name email role");

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

  if (!workflowStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid claim decision status");
  }

  const claim = await Claim.findByIdAndUpdate(
    req.params.id,
    {
      status,
      approvedAmount: Number(approvedAmount || 0),
      decisionNote,
      assignedAgent: req.body.assignedAgent,
      inspection: {
        scheduledAt: req.body.inspectionDate,
        inspector: req.body.inspector,
        result: req.body.inspectionResult || "pending",
        report: req.body.inspectionReport
      },
      repair: {
        garage: req.body.garage || undefined,
        estimateAmount: Number(req.body.repairEstimate || 0),
        status: req.body.repairStatus || "not-started",
        notes: req.body.repairNotes
      },
      decidedBy: req.user?._id,
      decidedAt: new Date()
    },
    { new: true, runValidators: true }
  )
    .populate("customer")
    .populate("policy")
    .populate("assignedAgent", "name email role")
    .populate("inspection.inspector", "name email role")
    .populate("repair.garage")
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

  await sendEmail(buildClaimStatusMessage(claim));

  res.json(claim);
});

export const refreshClaimFraudScore = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id);
  if (!claim) {
    res.status(404);
    throw new Error("Claim not found");
  }

  const risk = await calculateClaimRisk(claim);
  claim.fraud = {
    score: risk.score,
    level: risk.level,
    reasons: risk.reasons,
    calculatedAt: new Date()
  };
  await claim.save();
  res.json(await claim.populate(["customer", "policy"]));
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

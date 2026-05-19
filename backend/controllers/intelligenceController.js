import asyncHandler from "express-async-handler";
import Claim from "../models/Claim.js";
import Customer from "../models/Customer.js";
import Policy from "../models/Policy.js";
import Vehicle from "../models/Vehicle.js";
import {
  buildFraudSignals,
  buildRecommendationList,
  calculateClaimRisk
} from "../utils/riskScoring.js";

export const getIntelligenceOverview = asyncHandler(async (_req, res) => {
  const claims = await Claim.find()
    .populate("customer")
    .populate({ path: "policy", populate: { path: "vehicle" } })
    .sort({ createdAt: -1 })
    .limit(25);

  const claimRisk = await Promise.all(
    claims.map(async (claim) => ({
      claim,
      risk: await calculateClaimRisk(claim)
    }))
  );

  const [fraud, recommendations, totals] = await Promise.all([
    buildFraudSignals(),
    buildRecommendationList(),
    Promise.all([
      Customer.countDocuments(),
      Vehicle.countDocuments(),
      Policy.countDocuments(),
      Claim.countDocuments()
    ])
  ]);

  res.json({
    cards: {
      customers: totals[0],
      vehicles: totals[1],
      policies: totals[2],
      claims: totals[3],
      highRiskClaims: claimRisk.filter((item) => item.risk.level === "high").length,
      fraudSignals:
        fraud.summary.repeatedCustomerCount +
        fraud.summary.highAmountClaimCount +
        fraud.summary.sameVehicleCount +
        fraud.summary.blockedDocumentCustomerCount
    },
    claimRisk,
    fraud,
    recommendations
  });
});

export const getClaimRiskScore = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id)
    .populate("customer")
    .populate({ path: "policy", populate: { path: "vehicle" } });

  if (!claim) {
    res.status(404);
    throw new Error("Claim not found");
  }

  res.json({
    claim,
    risk: await calculateClaimRisk(claim)
  });
});

export const getPolicyRecommendations = asyncHandler(async (_req, res) => {
  res.json(await buildRecommendationList());
});

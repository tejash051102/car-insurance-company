import Claim from "../models/Claim.js";
import Customer from "../models/Customer.js";
import Policy from "../models/Policy.js";
import Vehicle from "../models/Vehicle.js";

const riskBand = (score) => {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
};

export const calculateClaimRisk = async (claim) => {
  const populated = claim.populate
    ? await claim.populate([{ path: "customer" }, { path: "policy", populate: { path: "vehicle" } }])
    : claim;

  const previousClaims = await Claim.countDocuments({
    customer: populated.customer?._id || populated.customer,
    _id: { $ne: populated._id }
  });

  const policyCoverage = Number(populated.policy?.coverageAmount || 0);
  const amount = Number(populated.claimAmount || 0);
  const ratio = policyCoverage ? amount / policyCoverage : 0;
  const description = String(populated.description || "").toLowerCase();

  let score = 18;
  const reasons = [];

  if (amount >= 100000) {
    score += 22;
    reasons.push("High claim amount");
  }

  if (ratio >= 0.75) {
    score += 24;
    reasons.push("Claim amount is close to policy coverage");
  } else if (ratio >= 0.45) {
    score += 14;
    reasons.push("Claim amount is a large part of coverage");
  }

  if (previousClaims >= 3) {
    score += 24;
    reasons.push("Customer has repeated previous claims");
  } else if (previousClaims >= 1) {
    score += 10;
    reasons.push("Customer has previous claim history");
  }

  if (!populated.documentUrl) {
    score += 12;
    reasons.push("No claim document attached");
  }

  if (/(fire|theft|total loss|stolen|fraud|fake)/i.test(description)) {
    score += 12;
    reasons.push("Incident description contains high-risk keywords");
  }

  if (populated.customer?.documents?.some?.((document) => document.scanStatus === "blocked")) {
    score += 18;
    reasons.push("Customer has blocked document scan history");
  }

  const finalScore = Math.min(score, 100);

  return {
    score: finalScore,
    level: riskBand(finalScore),
    previousClaims,
    amountCoverageRatio: Number(ratio.toFixed(2)),
    reasons: reasons.length ? reasons : ["No major risk indicators found"]
  };
};

export const buildPolicyRecommendation = (vehicle, customer) => {
  const value = Number(vehicle?.value || 0);
  const age = new Date().getFullYear() - Number(vehicle?.year || new Date().getFullYear());
  const vehicleType = vehicle?.vehicleType || "car";
  const isBike = vehicleType === "bike";
  const isHighValue = value >= 1000000;
  const isOlder = age >= 8;

  const type = isBike || isOlder ? "third-party" : isHighValue ? "comprehensive" : "collision";
  const coverageAmount = Math.max(Math.round(value * (type === "comprehensive" ? 0.9 : 0.6)), 75000);
  const rate = type === "comprehensive" ? 0.038 : type === "collision" ? 0.028 : 0.018;
  const premiumAmount = Math.round(Math.max(coverageAmount * rate, isBike ? 1800 : 4500));

  return {
    customer: customer?._id,
    customerName: customer?.fullName || customer?.email || "Customer",
    vehicle: vehicle?._id,
    vehicleLabel: `${vehicle?.make || ""} ${vehicle?.model || ""}`.trim() || vehicle?.registrationNumber,
    vehicleType,
    suggestedType: type,
    suggestedCoverage: coverageAmount,
    estimatedPremium: premiumAmount,
    reasons: [
      isHighValue ? "High-value vehicle needs stronger coverage" : "Vehicle value supports balanced coverage",
      isOlder ? "Older vehicle is better suited to basic protection" : "Vehicle age supports broader protection",
      isBike ? "Bike option selected with lower premium estimate" : "Car insurance portfolio pricing applied"
    ]
  };
};

export const buildFraudSignals = async () => {
  const repeatedCustomers = await Claim.aggregate([
    { $group: { _id: "$customer", count: { $sum: 1 }, totalAmount: { $sum: "$claimAmount" } } },
    { $match: { count: { $gte: 2 } } },
    { $sort: { count: -1, totalAmount: -1 } },
    { $limit: 10 }
  ]);

  const highAmountClaims = await Claim.find({ claimAmount: { $gte: 100000 } })
    .populate("customer")
    .populate("policy")
    .sort({ claimAmount: -1 })
    .limit(10);

  const sameVehicleClaims = await Claim.aggregate([
    { $lookup: { from: "policies", localField: "policy", foreignField: "_id", as: "policyDoc" } },
    { $unwind: "$policyDoc" },
    { $group: { _id: "$policyDoc.vehicle", count: { $sum: 1 }, claims: { $push: "$claimNumber" } } },
    { $match: { count: { $gte: 2 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const blockedDocumentCustomers = await Customer.find({ "documents.scanStatus": "blocked" })
    .select("firstName lastName email documents")
    .limit(10);

  return {
    repeatedCustomers,
    highAmountClaims,
    sameVehicleClaims,
    blockedDocumentCustomers,
    summary: {
      repeatedCustomerCount: repeatedCustomers.length,
      highAmountClaimCount: highAmountClaims.length,
      sameVehicleCount: sameVehicleClaims.length,
      blockedDocumentCustomerCount: blockedDocumentCustomers.length
    }
  };
};

export const buildRecommendationList = async () => {
  const policies = await Policy.find().select("vehicle");
  const insuredVehicleIds = new Set(policies.map((policy) => String(policy.vehicle)));
  const customers = await Customer.find().limit(100);

  const vehicles = [];
  for (const customer of customers) {
    const customerVehicles = await Vehicle.find({ customer: customer._id }).limit(10);
    customerVehicles
      .filter((vehicle) => !insuredVehicleIds.has(String(vehicle._id)))
      .forEach((vehicle) => vehicles.push(buildPolicyRecommendation(vehicle, customer)));
  }

  return vehicles.slice(0, 25);
};

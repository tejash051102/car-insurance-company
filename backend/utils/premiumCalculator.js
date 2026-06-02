const vehicleRates = {
  bike: 0.022,
  car: 0.032,
  suv: 0.04,
  van: 0.044,
  truck: 0.052,
  other: 0.035
};

const coverageFactors = {
  "third-party": 0.72,
  liability: 0.82,
  collision: 1.18,
  comprehensive: 1.35
};

export const calculatePremium = ({
  vehicleType = "car",
  vehicleValue = 0,
  vehicleAge = 0,
  claimHistory = 0,
  coverageType = "comprehensive"
}) => {
  const baseValue = Math.max(Number(vehicleValue) || 0, 0);
  const age = Math.max(Number(vehicleAge) || 0, 0);
  const claims = Math.max(Number(claimHistory) || 0, 0);
  const typeRate = vehicleRates[vehicleType] || vehicleRates.other;
  const coverageFactor = coverageFactors[coverageType] || coverageFactors.comprehensive;
  const ageFactor = Math.max(0.72, 1 - age * 0.035);
  const claimFactor = 1 + Math.min(claims, 5) * 0.12;
  const premiumAmount = Math.round(baseValue * typeRate * coverageFactor * ageFactor * claimFactor);

  return {
    premiumAmount,
    coverageAmount: Math.round(baseValue * (coverageType === "third-party" ? 0.4 : 0.9)),
    factors: {
      vehicleRate: typeRate,
      coverageFactor,
      ageFactor: Number(ageFactor.toFixed(2)),
      claimFactor: Number(claimFactor.toFixed(2))
    }
  };
};

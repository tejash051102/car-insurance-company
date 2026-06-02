const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount || 0);

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const normalizeMonthlySeries = (rows = [], valueKey = "total") => {
  const values = Array(12).fill(0);

  rows.forEach((row) => {
    const month = Number(row?._id?.month || 0);
    if (month >= 1 && month <= 12) {
      values[month - 1] = Number(row[valueKey] || 0);
    }
  });

  return values;
};

const makeLinePoints = (values, width = 680, height = 238, padding = 24, maxValue = 1) =>
  values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1 || 1)) * (width - padding * 2);
      const y = height - padding - (value / Math.max(maxValue, 1)) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

const PremiumsInTimeChart = ({ stats }) => {
  const revenueValues = normalizeMonthlySeries(stats?.monthlyRevenue);
  const claimValues = normalizeMonthlySeries(stats?.monthlyClaims);
  const maxValue = Math.max(...revenueValues, ...claimValues, 1);
  const markerIndex = revenueValues.reduce(
    (bestIndex, value, index) => (value >= revenueValues[bestIndex] ? index : bestIndex),
    0
  );
  const markerValue = revenueValues[markerIndex] || 0;
  const markerX = 24 + (markerIndex / 11) * (680 - 48);
  const markerY = 238 - 24 - (markerValue / maxValue) * (238 - 48);
  const totalRevenue = revenueValues.reduce((sum, value) => sum + value, 0);
  const totalClaims = claimValues.reduce((sum, value) => sum + value, 0);

  return (
    <section className="reference-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Premiums in Time</h3>
        <div className="flex gap-3 text-xs text-white/45">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-400" /> Revenue</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" /> Claims</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg">
        <svg className="h-[260px] w-full" viewBox="0 0 680 260" preserveAspectRatio="none">
          {[0, 1, 2, 3, 4].map((line) => (
            <line key={line} x1="35" x2="650" y1={35 + line * 45} y2={35 + line * 45} stroke="rgba(255,255,255,0.07)" strokeDasharray="3 5" />
          ))}
          <polyline points={makeLinePoints(claimValues, 680, 238, 24, maxValue)} fill="none" stroke="#6d28d9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
          <polyline points={makeLinePoints(revenueValues, 680, 238, 24, maxValue)} fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {markerValue > 0 ? (
            <>
              <circle cx={markerX} cy={markerY} r="5" fill="#0ea5e9" />
              <g transform={`translate(${Math.min(Math.max(markerX - 30, 36), 586)} ${Math.max(markerY - 62, 18)})`}>
                <rect width="72" height="44" rx="8" fill="rgba(255,255,255,0.12)" />
                <text x="36" y="20" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">{formatCurrency(markerValue)}</text>
                <text x="36" y="34" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10">{monthLabels[markerIndex]}</text>
              </g>
            </>
          ) : null}
        </svg>
        <div className="grid grid-cols-12 gap-1 px-7 text-center text-xs text-white/38">
          {monthLabels.map((month) => <span key={month}>{month}</span>)}
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-white/52 sm:grid-cols-3">
        <span>Total revenue {formatCurrency(totalRevenue)}</span>
        <span>Claim amount {formatCurrency(totalClaims)}</span>
        <span>Live from payments and claims</span>
      </div>
    </section>
  );
};

export default PremiumsInTimeChart;

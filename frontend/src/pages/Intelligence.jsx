import { AlertTriangle, BrainCircuit, Car, FileSearch, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";

const StatCard = ({ label, value, Icon }) => (
  <article className="panel p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-ink">{value ?? 0}</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white/10 text-cyan-300">
        <Icon size={22} />
      </div>
    </div>
  </article>
);

const riskClass = (level) =>
  level === "high"
    ? "bg-red-500/15 text-red-200"
    : level === "medium"
      ? "bg-amber-500/15 text-amber-200"
      : "bg-emerald-500/15 text-emerald-200";

const Intelligence = () => {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        const { data } = await api.get("/intelligence");
        setOverview(data);
      } catch (err) {
        setError(err.message);
      }
    };

    load();
  }, []);

  const cards = overview?.cards || {};

  return (
    <div className="space-y-6">
      <div>
        <p className="label">AI risk and fraud analytics</p>
        <h2 className="mt-1 text-2xl font-bold text-ink">AI & Fraud Center</h2>
      </div>

      {error ? <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="High Risk Claims" value={cards.highRiskClaims} Icon={ShieldAlert} />
        <StatCard label="Fraud Signals" value={cards.fraudSignals} Icon={AlertTriangle} />
        <StatCard label="Policies" value={cards.policies} Icon={FileSearch} />
        <StatCard label="Vehicles" value={cards.vehicles} Icon={Car} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="panel overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4">
            <h3 className="flex items-center gap-2 font-bold text-ink">
              <BrainCircuit size={18} className="text-cyan-300" />
              AI Claim Risk Score
            </h3>
          </div>
          <div className="divide-y divide-white/10">
            {(overview?.claimRisk || []).map(({ claim, risk }) => (
              <article key={claim._id} className="px-5 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-ink">{claim.claimNumber}</p>
                    <p className="text-sm text-slate-500">{claim.customer?.fullName || "Customer"} • amount {claim.claimAmount}</p>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold uppercase ${riskClass(risk.level)}`}>
                    {risk.score}% {risk.level}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{risk.reasons.join(" • ")}</p>
              </article>
            ))}
            {!overview?.claimRisk?.length ? <p className="px-5 py-8 text-center text-sm text-slate-500">No claims available for scoring.</p> : null}
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="flex items-center gap-2 font-bold text-ink">
            <Sparkles size={18} className="text-cyan-300" />
            Policy Recommendations
          </h3>
          <div className="mt-4 space-y-3">
            {(overview?.recommendations || []).slice(0, 8).map((item) => (
              <article key={`${item.customer}-${item.vehicle}`} className="rounded-md border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-ink">{item.customerName}</p>
                <p className="mt-1 text-sm text-slate-500">{item.vehicleLabel} • {item.vehicleType}</p>
                <p className="mt-2 text-sm text-cyan-200">{item.suggestedType} • premium {item.estimatedPremium}</p>
              </article>
            ))}
            {!overview?.recommendations?.length ? <p className="text-sm text-slate-500">No uninsured vehicles found for recommendation.</p> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="panel p-5">
          <h3 className="font-bold text-ink">Fraud Detection Dashboard</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries(overview?.fraud?.summary || {}).map(([key, value]) => (
              <div key={key} className="rounded-md border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold text-ink">{value}</p>
                <p className="mt-1 text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, " $1")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="font-bold text-ink">High Amount Claims</h3>
          <div className="mt-4 space-y-3">
            {(overview?.fraud?.highAmountClaims || []).map((claim) => (
              <div key={claim._id} className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-semibold text-ink">{claim.claimNumber}</p>
                  <p className="text-xs text-slate-500">{claim.customer?.fullName || "Customer"}</p>
                </div>
                <p className="font-bold text-amber-200">{claim.claimAmount}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Intelligence;

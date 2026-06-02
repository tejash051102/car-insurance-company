import {
  BadgeIndianRupee,
  Bell,
  Car,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  Mail,
  ShieldCheck,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import DashboardCard from "../components/DashboardCard.jsx";
import PremiumsInTimeChart from "../components/PremiumsInTimeChart.jsx";
import { canManageRecords } from "../utils/auth.js";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount || 0);

const ProgressRing = ({ percent }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80" aria-label={`${percent}%`}>
      <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="8" />
      <circle
        cx="40"
        cy="40"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.72)"
        strokeLinecap="round"
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <text x="-40" y="45" rotate="90" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">
        {percent}%
      </text>
    </svg>
  );
};

const MetricCard = ({ title, value, total, percent, icon: Icon, variant }) => (
  <article className={`reference-metric reference-metric-${variant}`}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18 text-white">
            <Icon size={17} />
          </span>
          <p className="text-sm font-semibold text-white/82">{title}</p>
        </div>
        <p className="text-3xl font-light tracking-wide text-white">{value}</p>
        <p className="mt-1 text-sm text-white/75">of {total} total</p>
      </div>
      <ProgressRing percent={percent} />
    </div>
  </article>
);

const IssuesPanel = ({ stats }) => {
  const rows = [
    `Policies expiring soon: ${stats?.expiringPolicies?.length || 0}`,
    `Claims awaiting review: ${(stats?.claimStatus || []).find((item) => item._id === "submitted")?.count || 0}`,
    `Claim approval rate: ${stats?.claimApprovalRate || 0}%`,
    `Customer portfolio health: ${stats?.totals?.customers || 0} customers`,
    `Premium revenue: ${formatCurrency(stats?.totals?.revenue)}`
  ];

  return (
    <section className="reference-panel p-5">
      <h3 className="text-lg font-semibold text-white">Insurance issues</h3>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <button key={row} className="flex w-full items-center justify-between rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 text-left text-sm font-medium text-white/48 transition hover:border-purple-400/50 hover:text-white" type="button">
            {row}
            <ChevronDown size={16} />
          </button>
        ))}
      </div>
    </section>
  );
};

const SettingsPanel = () => {
  const notices = [
    "Email notifications for risky claims and expiring policies.",
    "Document scan alerts for blocked customer uploads.",
    "Security alerts for failed logins and profile changes."
  ];

  return (
    <section className="reference-panel p-5 xl:row-span-2">
      <h3 className="text-lg font-semibold text-white">Environment Settings</h3>
      <div className="mt-5 space-y-4">
        {notices.map((notice) => (
          <article key={notice} className="rounded-lg border border-white/10 bg-white/[0.03] p-4 transition hover:border-purple-400/40">
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-400/15 text-purple-200">
                <Mail size={17} />
              </span>
              <div>
                <p className="font-semibold text-white">Smart Notifications</p>
                <p className="mt-2 text-sm leading-6 text-white/42">{notice}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const PremiumEstimator = () => {
  const [form, setForm] = useState({ vehicleType: "car", value: 900000, age: 2, coverage: "comprehensive" });

  const premium = useMemo(() => {
    const typeFactor = { car: 0.032, bike: 0.022, suv: 0.04, truck: 0.052, van: 0.044, other: 0.035 }[form.vehicleType];
    const coverageFactor = { comprehensive: 1.35, collision: 1.18, liability: 0.82, "third-party": 0.72 }[form.coverage];
    const ageFactor = Math.max(0.72, 1 - Number(form.age || 0) * 0.035);
    return Math.round(Number(form.value || 0) * typeFactor * coverageFactor * ageFactor);
  }, [form]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <section className="reference-panel p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Live premium estimation</h3>
          <p className="mt-1 text-sm text-white/38">Instant pricing simulator</p>
        </div>
        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-100">Live</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="field" name="vehicleType" value={form.vehicleType} onChange={update}>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
          <option value="suv">SUV</option>
          <option value="truck">Truck</option>
          <option value="van">Van</option>
        </select>
        <select className="field" name="coverage" value={form.coverage} onChange={update}>
          <option value="comprehensive">Comprehensive</option>
          <option value="collision">Collision</option>
          <option value="liability">Liability</option>
          <option value="third-party">Third Party</option>
        </select>
      </div>
      <label className="mt-4 block space-y-2">
        <span className="text-xs font-bold uppercase tracking-wide text-white/35">Vehicle value</span>
        <input className="field" name="value" type="range" min="50000" max="3500000" step="25000" value={form.value} onChange={update} />
      </label>
      <div className="mt-5 rounded-lg bg-gradient-to-br from-purple-600/35 to-pink-600/25 p-4">
        <p className="text-sm text-white/58">Estimated annual premium</p>
        <p className="mt-1 text-3xl font-light text-white">{formatCurrency(premium)}</p>
      </div>
    </section>
  );
};

const VehicleTypePanel = ({ stats }) => {
  const rows = stats?.topVehicleTypes?.length ? stats.topVehicleTypes : [];
  const max = Math.max(...rows.map((row) => row.count), 1);

  return (
    <section className="reference-panel p-5">
      <h3 className="text-lg font-semibold text-white">Top Vehicle Types</h3>
      <div className="mt-5 space-y-3">
        {rows.map((row) => (
          <div key={row._id || "unknown"}>
            <div className="mb-1 flex justify-between text-xs font-semibold capitalize text-white/55">
              <span>{row._id || "unknown"}</span>
              <span>{row.count}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-emerald-300" style={{ width: `${Math.max((row.count / max) * 100, 8)}%` }} />
            </div>
          </div>
        ))}
        {!rows.length ? <p className="text-sm text-white/42">No vehicle analytics yet.</p> : null}
      </div>
    </section>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const canManage = canManageRecords();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api.get("/dashboard");
        setStats(data);
      } catch (err) {
        setError(err.message);
      }
    };

    loadStats();
    const interval = window.setInterval(loadStats, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const totals = stats?.totals || {};
  const claimTotal = (stats?.claimStatus || []).reduce((sum, item) => sum + (item.count || 0), 0);
  const submittedClaims = (stats?.claimStatus || []).find((item) => item._id === "submitted")?.count || 0;
  const revenuePercent = Math.min(Math.round((totals.revenue || 0) / 100000), 98);

  const sendExpiryReminders = async () => {
    setError("");
    setNotice("");

    try {
      const { data } = await api.post("/policies/expiry-reminders", { days: 30 });
      setNotice(`${data.message}: ${data.sent} sent, ${data.skipped} skipped`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <p className="label">Overview</p>
          <h2 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">Insurance Operations Dashboard</h2>
        </div>
        {canManage ? (
          <button className="btn-secondary w-full sm:w-fit" type="button" onClick={sendExpiryReminders}>
            <Bell size={16} />
            Send reminders
          </button>
        ) : null}
      </div>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {notice ? <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <DashboardCard title="Customers" value={totals.customers || 0} icon={Users} accent="brand" />
        <DashboardCard title="Vehicles" value={totals.vehicles || 0} icon={Car} accent="mint" />
        <DashboardCard title="Policies" value={totals.policies || 0} icon={FileCheck2} accent="brand" />
        <DashboardCard title="Active Policies" value={totals.activePolicies || 0} icon={ShieldCheck} accent="coral" />
        <DashboardCard title="Pending Claims" value={totals.pendingClaims || 0} icon={ClipboardCheck} accent="coral" />
        <DashboardCard title="Revenue" value={formatCurrency(totals.revenue)} icon={BadgeIndianRupee} accent="slate" />
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Customers" value={String(totals.customers || 0).padStart(2, "0")} total={Math.max(totals.customers || 0, 1)} percent={80} icon={Users} variant="purple" />
        <MetricCard title="Vehicles Insured" value={String(totals.vehicles || 0).padStart(2, "0")} total={Math.max(totals.vehicles || 0, 1)} percent={49} icon={Car} variant="blue" />
        <MetricCard title="Open Claims" value={String(submittedClaims || claimTotal || 0).padStart(2, "0")} total={Math.max(claimTotal || 0, 1)} percent={63} icon={ClipboardCheck} variant="violet" />
        <MetricCard title="Premium Revenue" value={formatCurrency(totals.revenue).replace("₹", "")} total="target" percent={revenuePercent || 26} icon={BadgeIndianRupee} variant="pink" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.52fr]">
        <PremiumsInTimeChart stats={stats} />
        <SettingsPanel />
        <div className="grid gap-6 md:grid-cols-2">
          <IssuesPanel stats={stats} />
          <PremiumEstimator />
          <VehicleTypePanel stats={stats} />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

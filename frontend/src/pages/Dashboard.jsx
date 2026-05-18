import {
  BadgeIndianRupee,
  Bell,
  Car,
  ChevronDown,
  ClipboardCheck,
  Mail,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";

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

const makeLinePoints = (values, width = 640, height = 220, padding = 24) => {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);

  return values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1 || 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");
};

const RevenueLineChart = ({ stats }) => {
  const revenue = stats?.monthlyRevenue || [];
  const values = revenue.length ? revenue.map((item) => item.total || 0) : [1200, 3400, 4100, 3300, 2600, 2900, 3900, 4700, 4200, 3100, 2800, 3600];
  const claims = stats?.claimStatus?.length ? stats.claimStatus.map((item) => (item.count || 0) * 900) : [800, 2900, 1300, 2100, 3600, 3300, 2500, 1700, 900, 1100, 2100, 3700];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const markerValue = values[6] || values[Math.floor(values.length / 2)] || 0;

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
          <polyline points={makeLinePoints(claims, 680, 238)} fill="none" stroke="#6d28d9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
          <polyline points={makeLinePoints(values, 680, 238)} fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="386" cy="112" r="5" fill="#0ea5e9" />
          <g>
            <rect x="370" y="50" width="58" height="42" rx="8" fill="rgba(255,255,255,0.12)" />
            <text x="399" y="70" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">{formatCurrency(markerValue)}</text>
            <text x="399" y="84" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10">July</text>
          </g>
        </svg>
        <div className="grid grid-cols-12 gap-1 px-7 text-center text-xs text-white/38">
          {months.map((month) => <span key={month}>{month}</span>)}
        </div>
      </div>
    </section>
  );
};

const ReportChart = ({ stats }) => {
  const values = (stats?.policyStatus || []).length
    ? stats.policyStatus.map((item) => 30 + (item.count || 0) * 16)
    : [42, 88, 76, 45, 54, 72, 61, 80];
  const points = values.map((value, index) => `${26 + index * 38},${140 - value}`).join(" ");

  return (
    <section className="reference-panel p-5">
      <h3 className="text-lg font-semibold text-white">Claim trend report</h3>
      <p className="mt-1 text-sm text-white/38">1 Mar 2026 - 31 Mar 2026</p>
      <svg className="mt-4 h-48 w-full" viewBox="0 0 320 170" preserveAspectRatio="none">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((line) => (
          <line key={line} x1={25 + line * 38} x2={25 + line * 38} y1="12" y2="150" stroke="rgba(255,255,255,0.07)" strokeDasharray="2 5" />
        ))}
        <defs>
          <linearGradient id="reportFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#9333ea" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#9333ea" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polyline points={points} fill="none" stroke="#9333ea" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <polygon points={`26,150 ${points} 292,150`} fill="url(#reportFill)" />
      </svg>
      <div className="grid grid-cols-8 text-center text-xs text-white/38">
        {["21", "22", "23", "24", "25", "26", "27", "28"].map((day) => <span key={day}>{day}</span>)}
      </div>
    </section>
  );
};

const IssuesPanel = ({ stats }) => {
  const rows = [
    `Policies expiring soon: ${stats?.expiringPolicies?.length || 0}`,
    `Claims awaiting review: ${(stats?.claimStatus || []).find((item) => item._id === "submitted")?.count || 0}`,
    `Customer portfolio health: ${stats?.totals?.customers || 0} customers`,
    `Premium revenue: ${formatCurrency(stats?.totals?.revenue)}`
  ];

  return (
    <section className="reference-panel p-5">
      <h3 className="text-lg font-semibold text-white">Insurance issues</h3>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <button key={row} className="flex w-full items-center justify-between rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 text-left text-sm font-medium text-white/48 transition hover:border-purple-400/50 hover:text-white">
            {row}
            <ChevronDown size={16} />
          </button>
        ))}
      </div>
      <button className="mx-auto mt-4 flex rounded-full border border-white/10 px-8 py-2 text-sm font-semibold text-white/65 transition hover:bg-white/10" type="button">
        View more
      </button>
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
                <button className="mt-3 rounded-full border border-white/10 px-4 py-1.5 text-xs font-semibold text-white/58 transition hover:bg-white/10" type="button">
                  Read more
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <button className="mt-4 w-full rounded-full border border-white/10 py-3 text-sm font-semibold text-white/65 transition hover:bg-white/10" type="button">
        Show more
      </button>
    </section>
  );
};

const PremiumEstimator = () => {
  const [form, setForm] = useState({ vehicleType: "car", value: 900000, age: 2, coverage: "comprehensive" });

  const premium = useMemo(() => {
    const typeFactor = { car: 0.032, bike: 0.022, suv: 0.04, truck: 0.052, van: 0.044, other: 0.035 }[form.vehicleType];
    const coverageFactor = { comprehensive: 1.35, collision: 1.18, liability: 0.82, thirdParty: 0.72 }[form.coverage];
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
          <option value="thirdParty">Third Party</option>
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

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

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
  }, []);

  const totals = stats?.totals || {};
  const claimTotal = (stats?.claimStatus || []).reduce((sum, item) => sum + (item.count || 0), 0);
  const submittedClaims = (stats?.claimStatus || []).find((item) => item._id === "submitted")?.count || 0;
  const revenuePercent = Math.min(Math.round((totals.revenue || 0) / 100000), 98);

  return (
    <div className="reference-dashboard space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-white">Dashboard</h2>
          <p className="mt-2 text-sm text-white/38">Car insurance analytics, claims, premiums, and security operations.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/54 md:flex">
          <Bell size={16} />
          Live insurance monitoring
        </div>
      </div>

      {error ? <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Customers" value={String(totals.customers || 0).padStart(2, "0")} total={Math.max(totals.customers || 0, 1)} percent={80} icon={Users} variant="purple" />
        <MetricCard title="Vehicles Insured" value={String(totals.vehicles || 0).padStart(2, "0")} total={Math.max(totals.vehicles || 0, 1)} percent={49} icon={Car} variant="blue" />
        <MetricCard title="Open Claims" value={String(submittedClaims || claimTotal || 0).padStart(2, "0")} total={Math.max(claimTotal || 0, 1)} percent={63} icon={ClipboardCheck} variant="violet" />
        <MetricCard title="Premium Revenue" value={formatCurrency(totals.revenue).replace("₹", "")} total="target" percent={revenuePercent || 26} icon={BadgeIndianRupee} variant="pink" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.52fr]">
        <RevenueLineChart stats={stats} />
        <SettingsPanel />
        <div className="grid gap-6 md:grid-cols-2">
          <IssuesPanel stats={stats} />
          <ReportChart stats={stats} />
          <PremiumEstimator />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

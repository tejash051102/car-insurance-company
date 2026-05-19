import { AlertTriangle, Fingerprint, History, Lock, ScanLine, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";

const cardMeta = [
  ["totalAlerts", "Security Alerts", AlertTriangle],
  ["highAlerts", "High Risk Open", ShieldCheck],
  ["failedLogins", "Failed Logins 24h", Lock],
  ["suspiciousLogins", "Suspicious 24h", Fingerprint],
  ["lockedAccounts", "Locked Accounts", Lock],
  ["blockedUploads", "Blocked Uploads", ScanLine]
];

const SecurityCenter = () => {
  const [overview, setOverview] = useState(null);
  const [scores, setScores] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      setError("");
      try {
        const [overviewResponse, scoreResponse] = await Promise.all([
          api.get("/security/overview"),
          api.get("/security/scores")
        ]);
        setOverview(overviewResponse.data);
        setScores(scoreResponse.data);
      } catch (err) {
        setError(err.message);
      }
    };

    loadOverview();
  }, []);

  const cards = overview?.cards || {};

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Cyber security monitoring</p>
        <h2 className="mt-1 text-2xl font-bold text-ink">Security Center</h2>
      </div>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cardMeta.map(([key, label, Icon]) => (
          <article key={key} className="panel p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold text-ink">{cards[key] ?? 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-cyan-50 text-brand">
                <Icon size={22} />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="panel overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="font-bold text-ink">Security Alerts</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {(overview?.recentAlerts || []).map((alert) => (
              <article key={alert._id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{alert.message}</p>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                    alert.severity === "critical" || alert.severity === "high" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{alert.type} • {alert.ipAddress} • {alert.createdAt?.slice(0, 19).replace("T", " ")}</p>
              </article>
            ))}
            {!overview?.recentAlerts?.length ? <p className="px-5 py-8 text-center text-sm text-slate-500">No alerts yet.</p> : null}
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="font-bold text-ink">Login History</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {(overview?.recentLogins || []).map((login) => (
              <article key={login._id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{login.email || "Unknown user"}</p>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                    login.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  }`}>
                    {login.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{login.role || "N/A"} • {login.ipAddress} • {login.flags?.join(", ") || "normal"}</p>
                <p className="mt-1 truncate text-xs text-slate-400">{login.device}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-brand" />
          <h3 className="font-bold text-ink">Cyber Security Score</h3>
        </div>
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <p className="text-3xl font-bold text-ink">{scores?.average ?? 100}%</p>
            <p className="text-sm text-slate-500">Average score</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <p className="text-3xl font-bold text-ink">{scores?.risky ?? 0}</p>
            <p className="text-sm text-slate-500">Risk accounts</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(scores?.scores || []).slice(0, 9).map((item) => (
            <article key={`${item.model}-${item._id}`} className="rounded-md border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.role} • {item.email}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${item.score < 55 ? "bg-red-500/15 text-red-200" : item.score < 80 ? "bg-amber-500/15 text-amber-200" : "bg-emerald-500/15 text-emerald-200"}`}>
                  {item.score}%
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Failed {item.failed} • Suspicious {item.suspicious} • Alerts {item.criticalAlerts}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <History size={18} className="text-brand" />
          <h3 className="font-bold text-ink">Audit Log Dashboard</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {(overview?.auditLogs || []).map((log) => (
            <article key={log._id} className="rounded-md border border-slate-200 bg-white px-4 py-3">
              <p className="font-semibold text-ink">{log.message}</p>
              <p className="mt-1 text-xs text-slate-500">{log.actorName || "System"} • {log.action} • {log.ipAddress || "unknown IP"}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel p-5">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck size={18} className="text-brand" />
          <h3 className="font-bold text-ink">Encrypted Sensitive Fields</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {(overview?.encryption || []).map((item) => (
            <span key={item} className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
              {item}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SecurityCenter;

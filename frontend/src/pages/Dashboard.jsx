import {
  BadgeIndianRupee,
  BriefcaseBusiness,
  ClipboardCheck,
  FileCheck2,
  ShieldCheck,
  UserRound,
  Users,
  Car
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";
import DashboardCard from "../components/DashboardCard.jsx";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

const statusLabel = (value) => value || "unknown";

const BarList = ({ title, data = [], color = "bg-cyan-500" }) => {
  const max = Math.max(...data.map((item) => item.count || item.total || 0), 1);

  return (
    <section className="panel p-5">
      <h3 className="mb-4 text-lg font-bold text-ink">{title}</h3>
      <div className="space-y-3">
        {data.map((item) => {
          const value = item.count || item.total || 0;
          const label = item._id?.month ? `${item._id.month}/${item._id.year}` : statusLabel(item._id);

          return (
            <div key={label}>
              <div className="mb-1 flex justify-between text-xs font-semibold capitalize text-slate-500">
                <span>{label}</span>
                <span>{item.total ? formatCurrency(value) : value}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.max((value / max) * 100, 6)}%` }} />
              </div>
            </div>
          );
        })}
        {!data.length ? <p className="text-sm text-slate-500">No chart data available.</p> : null}
      </div>
    </section>
  );
};

const MetricTile = ({ title, value, icon: Icon }) => (
  <div className="rounded-md border border-white/10 bg-white/5 p-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-300/20">
        <Icon size={19} />
      </div>
    </div>
  </div>
);

const HierarchyStats = ({ hierarchy }) => {
  if (!hierarchy) return null;

  if (hierarchy.role === "admin") {
    return (
      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <BriefcaseBusiness size={20} className="text-cyan-300" />
          <h3 className="text-lg font-bold text-ink">Admin Organization View</h3>
        </div>
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <MetricTile title="Managers" value={hierarchy.totals?.managers || 0} icon={Users} />
          <MetricTile title="Agents" value={hierarchy.totals?.agents || 0} icon={UserRound} />
          <MetricTile title="All Customers" value={hierarchy.totals?.customers || 0} icon={Users} />
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="overflow-x-auto">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Managers</h4>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Manager</th>
                  <th className="px-3 py-2">Agents</th>
                  <th className="px-3 py-2">Direct Customers</th>
                  <th className="px-3 py-2">Team Customers</th>
                </tr>
              </thead>
              <tbody>
                {(hierarchy.managers || []).map((manager) => (
                  <tr key={manager._id} className="border-b border-slate-100">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-ink">{manager.name}</p>
                      <p className="text-xs text-slate-500">{manager.email}</p>
                    </td>
                    <td className="px-3 py-3">{manager.agentCount}</td>
                    <td className="px-3 py-3">{manager.customerCount}</td>
                    <td className="px-3 py-3">{manager.teamCustomerCount}</td>
                  </tr>
                ))}
                {!hierarchy.managers?.length ? (
                  <tr><td className="px-3 py-6 text-center text-slate-500" colSpan="4">No managers found.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className="overflow-x-auto">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Agents</h4>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Agent</th>
                  <th className="px-3 py-2">Manager</th>
                  <th className="px-3 py-2">Customers</th>
                </tr>
              </thead>
              <tbody>
                {(hierarchy.agents || []).map((agent) => (
                  <tr key={agent._id} className="border-b border-slate-100">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-ink">{agent.name}</p>
                      <p className="text-xs text-slate-500">{agent.email}</p>
                    </td>
                    <td className="px-3 py-3">{agent.managerName}</td>
                    <td className="px-3 py-3">{agent.customerCount}</td>
                  </tr>
                ))}
                {!hierarchy.agents?.length ? (
                  <tr><td className="px-3 py-6 text-center text-slate-500" colSpan="3">No agents found.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  if (hierarchy.role === "manager") {
    return (
      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <BriefcaseBusiness size={20} className="text-cyan-300" />
          <h3 className="text-lg font-bold text-ink">Manager Team View</h3>
        </div>
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <MetricTile title="Agents Under Me" value={hierarchy.totals?.agents || 0} icon={UserRound} />
          <MetricTile title="My Customers" value={hierarchy.totals?.ownCustomers || 0} icon={Users} />
          <MetricTile title="Team Customers" value={hierarchy.totals?.teamCustomers || 0} icon={Users} />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(hierarchy.agents || []).map((agent) => (
            <div key={agent._id} className="rounded-md border border-slate-200 p-3">
              <p className="font-semibold text-ink">{agent.name}</p>
              <p className="text-xs text-slate-500">{agent.email}</p>
              <p className="mt-3 text-sm text-slate-500">Customers added: <span className="font-bold text-ink">{agent.customerCount}</span></p>
            </div>
          ))}
          {!hierarchy.agents?.length ? <p className="text-sm text-slate-500">No agents assigned under you yet.</p> : null}
        </div>
      </section>
    );
  }

  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-center gap-2">
        <UserRound size={20} className="text-cyan-300" />
        <h3 className="text-lg font-bold text-ink">Agent Customer View</h3>
      </div>
      <MetricTile title="Customers Added By Me" value={hierarchy.totals?.customers || 0} icon={Users} />
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="label">Overview</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">Insurance Operations Dashboard</h2>
        </div>
        <p className="text-sm text-slate-500">Live figures from policies, claims, and payments.</p>
      </div>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Customers" value={totals.customers || 0} icon={Users} accent="brand" />
        <DashboardCard title="Vehicles" value={totals.vehicles || 0} icon={Car} accent="mint" />
        <DashboardCard title="Active Policies" value={totals.activePolicies || 0} icon={ShieldCheck} accent="coral" />
        <DashboardCard title="Revenue" value={formatCurrency(totals.revenue)} icon={BadgeIndianRupee} accent="slate" />
      </div>

      <HierarchyStats hierarchy={stats?.hierarchy} />

      <div className="grid gap-6 xl:grid-cols-3">
        <BarList title="Policy Status" data={stats?.policyStatus || []} color="bg-cyan-500" />
        <BarList title="Claim Status" data={stats?.claimStatus || []} color="bg-orange-500" />
        <BarList title="Monthly Revenue" data={stats?.monthlyRevenue || []} color="bg-emerald-500" />
      </div>

      <section className="panel p-5">
        <h3 className="mb-4 text-lg font-bold text-ink">Policy Expiry Reminders</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {(stats?.expiringPolicies || []).map((policy) => (
            <div key={policy._id} className="rounded-md border border-slate-200 p-3">
              <p className="font-semibold text-ink">{policy.policyNumber}</p>
              <p className="text-sm text-slate-500">{policy.customer?.fullName || "N/A"}</p>
              <p className="mt-2 text-xs text-slate-500">Expires {policy.endDate?.slice(0, 10)}</p>
            </div>
          ))}
          {!stats?.expiringPolicies?.length ? <p className="text-sm text-slate-500">No policies expiring in 30 days.</p> : null}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileCheck2 size={20} className="text-brand" />
            <h3 className="text-lg font-bold text-ink">Recent Policies</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Policy</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Vehicle</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentPolicies || []).map((policy) => (
                  <tr key={policy._id} className="border-b border-slate-100">
                    <td className="px-3 py-3 font-semibold text-ink">{policy.policyNumber}</td>
                    <td className="px-3 py-3">{policy.customer?.fullName || "N/A"}</td>
                    <td className="px-3 py-3">{policy.vehicle?.registrationNumber || "N/A"}</td>
                    <td className="px-3 py-3 capitalize">{policy.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardCheck size={20} className="text-coral" />
            <h3 className="text-lg font-bold text-ink">Recent Claims</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Claim</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentClaims || []).map((claim) => (
                  <tr key={claim._id} className="border-b border-slate-100">
                    <td className="px-3 py-3 font-semibold text-ink">{claim.claimNumber}</td>
                    <td className="px-3 py-3">{claim.customer?.fullName || "N/A"}</td>
                    <td className="px-3 py-3">{formatCurrency(claim.claimAmount)}</td>
                    <td className="px-3 py-3 capitalize">{claim.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";

const roles = ["admin", "manager", "agent", "customer"];

const formatAccess = (value) => {
  if (value === true) return "Allowed";
  if (value === false) return "No access";
  return value;
};

const RbacReport = () => {
  const [report, setReport] = useState({ permissions: [], notes: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReport = async () => {
      setError("");
      try {
        const { data } = await api.get("/security/rbac-report");
        setReport(data);
      } catch (err) {
        setError(err.message);
      }
    };

    loadReport();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Role based access control</p>
        <h2 className="mt-1 text-2xl font-bold text-ink">RBAC Report</h2>
      </div>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Module</th>
                {roles.map((role) => (
                  <th key={role} className="px-4 py-3 capitalize">{role}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.permissions.map((row) => (
                <tr key={row.module} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-ink">{row.module}</td>
                  {roles.map((role) => (
                    <td key={role} className="px-4 py-3 capitalize">{formatAccess(row[role])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-brand" />
          <h3 className="font-bold text-ink">Access Rules Summary</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {report.notes.map((note) => (
            <p key={note} className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              {note}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RbacReport;

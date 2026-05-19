import { Download, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { downloadBlob } from "../utils/download.js";

const reportTypes = [
  ["customers", "Customers"],
  ["policies", "Policies"],
  ["claims", "Claims"],
  ["payments", "Payments"],
  ["audit", "Audit Logs"],
  ["security", "Security Alerts"]
];

const Reports = () => {
  const [overview, setOverview] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/reports");
        setOverview(data);
      } catch (err) {
        setError(err.message);
      }
    };

    load();
  }, []);

  const download = async (type) => {
    const response = await api.get(`/reports/${type}/pdf`, { responseType: "blob" });
    downloadBlob(response.data, `${type}-report.pdf`);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Downloadable PDF reports</p>
        <h2 className="mt-1 text-2xl font-bold text-ink">Reports Center</h2>
      </div>

      {error ? <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportTypes.map(([type, label]) => (
          <article key={type} className="panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <FileText className="text-cyan-300" />
                <h3 className="mt-3 font-bold text-ink">{label} Report</h3>
                <p className="mt-2 text-sm text-slate-500">{overview[type === "audit" ? "auditLogs" : type === "security" ? "securityAlerts" : type] ?? 0} records available</p>
              </div>
              <button className="btn-secondary" type="button" onClick={() => download(type)}>
                <Download size={16} />
                PDF
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Reports;

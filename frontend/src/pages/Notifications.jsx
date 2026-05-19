import { Bell, CheckCircle2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";

const tone = {
  critical: "bg-red-500/15 text-red-200",
  warning: "bg-amber-500/15 text-amber-200",
  success: "bg-emerald-500/15 text-emerald-200",
  info: "bg-cyan-500/15 text-cyan-200"
};

const Notifications = () => {
  const [data, setData] = useState({ saved: [], generated: [], unread: 0 });
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const response = await api.get("/notifications");
      setData(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const notifications = [...(data.generated || []), ...(data.saved || [])];

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Policy, claim, payment, and security alerts</p>
        <h2 className="mt-1 text-2xl font-bold text-ink">Notification Center</h2>
      </div>

      {error ? <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="panel p-5">
          <Bell className="text-cyan-300" />
          <p className="mt-3 text-3xl font-bold text-ink">{notifications.length}</p>
          <p className="text-sm text-slate-500">Total alerts</p>
        </article>
        <article className="panel p-5">
          <ShieldAlert className="text-red-300" />
          <p className="mt-3 text-3xl font-bold text-ink">{notifications.filter((item) => item.severity === "critical").length}</p>
          <p className="text-sm text-slate-500">Critical alerts</p>
        </article>
        <article className="panel p-5">
          <CheckCircle2 className="text-emerald-300" />
          <p className="mt-3 text-3xl font-bold text-ink">{data.unread}</p>
          <p className="text-sm text-slate-500">Unread/generated</p>
        </article>
      </section>

      <section className="panel overflow-hidden">
        <div className="divide-y divide-white/10">
          {notifications.map((item) => (
            <article key={item._id} className="px-5 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.message}</p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold uppercase ${tone[item.severity] || tone.info}`}>
                  {item.type} • {item.severity}
                </span>
              </div>
            </article>
          ))}
          {!notifications.length ? <p className="px-5 py-8 text-center text-sm text-slate-500">No notifications yet.</p> : null}
        </div>
      </section>
    </div>
  );
};

export default Notifications;

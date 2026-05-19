import { History, Search } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";
import Pagination from "../components/Pagination.jsx";
import { getItems, getMeta } from "../utils/apiData.js";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [error, setError] = useState("");

  const loadActivities = async (page = 1, term = search) => {
    setError("");
    try {
      const { data } = await api.get("/activities", {
        params: { page, limit: 12, ...(term ? { search: term } : {}) }
      });
      setActivities(getItems(data));
      setMeta(getMeta(data));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="label">Audit trail</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">Activity Logs</h2>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            loadActivities(1, search);
          }}
        >
          <input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search activity" />
          <button className="btn-secondary" type="submit" aria-label="Search activities">
            <Search size={16} />
          </button>
        </form>
      </div>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="panel overflow-hidden">
        <div className="divide-y divide-slate-100">
          {activities.map((activity) => (
            <article key={activity._id} className="flex gap-4 px-5 py-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-cyan-50 text-brand">
                <History size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-ink">{activity.message}</p>
                  <time className="text-xs text-slate-500">{activity.createdAt?.slice(0, 19).replace("T", " ")}</time>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {activity.actorName || activity.actor?.name || "System"} • {activity.entityType} • {activity.action}
                </p>
              </div>
            </article>
          ))}
          {!activities.length ? <p className="px-5 py-8 text-center text-sm text-slate-500">No activity found.</p> : null}
        </div>
        <Pagination meta={meta} onPageChange={(page) => loadActivities(page, search)} />
      </section>
    </div>
  );
};

export default Activities;

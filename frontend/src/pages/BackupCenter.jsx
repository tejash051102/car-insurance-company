import { DatabaseBackup, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";

const BackupCenter = () => {
  const [backups, setBackups] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setError("");
    try {
      const { data } = await api.get("/backups");
      setBackups(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createBackup = async () => {
    setLoading(true);
    setNotice("");
    try {
      await api.post("/backups", { notes: "Admin-created simulation backup" });
      setNotice("Backup simulation created");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const restore = async (id) => {
    const { data } = await api.patch(`/backups/${id}/restore`);
    setNotice(data.message);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="label">Cyber resilience simulation</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">Backup & Restore</h2>
        </div>
        <button className="btn-primary" type="button" onClick={createBackup} disabled={loading}>
          <DatabaseBackup size={16} />
          {loading ? "Creating..." : "Create Backup"}
        </button>
      </div>

      {error ? <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
      {notice ? <div className="rounded-md bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</div> : null}

      <section className="panel overflow-hidden">
        <div className="divide-y divide-white/10">
          {backups.map((backup) => (
            <article key={backup._id} className="px-5 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold text-ink">{backup.backupNumber} • {backup.status}</p>
                  <p className="mt-1 text-sm text-slate-500">Checksum {backup.checksum?.slice(0, 18)} • {backup.createdAt?.slice(0, 10)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(backup.collections || {}).map(([key, value]) => (
                      <span key={key} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/70">{key}: {value}</span>
                    ))}
                  </div>
                </div>
                <button className="btn-secondary" type="button" onClick={() => restore(backup._id)}>
                  <RotateCcw size={16} />
                  Simulate Restore
                </button>
              </div>
            </article>
          ))}
          {!backups.length ? <p className="px-5 py-8 text-center text-sm text-slate-500">No backup snapshots yet.</p> : null}
        </div>
      </section>
    </div>
  );
};

export default BackupCenter;

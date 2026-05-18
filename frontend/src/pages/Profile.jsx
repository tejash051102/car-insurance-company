import { Mail, Save, ShieldCheck, Upload, UserCircle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import api, { getAssetUrl } from "../api/axios.js";
import { getCurrentUser } from "../utils/auth.js";
import { saveAuthUser } from "../utils/authStorage.js";

const Profile = () => {
  const currentUser = getCurrentUser();
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    password: "",
    passwordOtp: "",
    avatar: null
  });
  const [preview, setPreview] = useState(currentUser?.avatarUrl ? getAssetUrl(currentUser.avatarUrl) : "");
  const [team, setTeam] = useState({ managers: [], agents: [] });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const canAssignAgents = ["admin", "manager"].includes(currentUser?.role);

  useEffect(() => {
    const loadTeam = async () => {
      if (!canAssignAgents) return;

      try {
        const { data } = await api.get("/users/team");
        setTeam(data);
      } catch (err) {
        setError(err.message);
      }
    };

    loadTeam();
  }, [canAssignAgents]);

  const updateField = (event) => {
    const { name, value, files } = event.target;

    if (files) {
      const file = files[0];
      setForm((current) => ({ ...current, [name]: file }));
      setPreview(file ? URL.createObjectURL(file) : "");
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const data = new FormData();
    data.append("name", form.name);
    data.append("email", form.email);
    data.append("phone", form.phone);
    if (form.password) data.append("password", form.password);
    if (form.password) data.append("passwordOtp", form.passwordOtp);
    if (form.avatar) data.append("avatar", form.avatar);

    try {
      const response = await api.put("/auth/profile", data);
      saveAuthUser(response.data);
      setForm((current) => ({ ...current, password: "", passwordOtp: "", avatar: null }));
      setPreview(response.data.avatarUrl ? getAssetUrl(response.data.avatarUrl) : "");
      setNotice("Profile updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const requestPasswordOtp = async () => {
    setError("");
    setNotice("");

    if (!form.password) {
      setError("Enter a new password before requesting OTP");
      return;
    }

    try {
      const { data } = await api.post("/auth/profile/password-otp");
      setNotice(data.otp ? `${data.message} OTP: ${data.otp}` : data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  const assignManager = async (agentId, managerId) => {
    setError("");
    setNotice("");

    try {
      await api.patch(`/users/agents/${agentId}/manager`, { manager: managerId || null });
      const { data } = await api.get("/users/team");
      setTeam(data);
      setNotice("Agent assignment updated");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Account</p>
        <h2 className="mt-1 text-2xl font-bold text-ink">Profile</h2>
      </div>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {notice ? <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}

      <section className="panel p-6">
        <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[260px_1fr]">
          <div className="flex flex-col items-center rounded-md border border-white/10 bg-white/5 p-5 text-center">
            <label className="group relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300 transition hover:border-cyan-300/50 hover:bg-cyan-400/20" title="Upload profile image">
              {preview ? <img src={preview} alt="Profile" className="h-full w-full object-cover" /> : <UserCircle size={64} strokeWidth={1.5} />}
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-slate-950/80 py-1.5 text-[11px] font-bold text-cyan-100 opacity-0 transition group-hover:opacity-100">
                <Upload size={13} />
                Upload
              </span>
              <input className="hidden" name="avatar" type="file" accept=".jpg,.jpeg,.png" onChange={updateField} />
            </label>
            <p className="mt-4 text-sm font-bold uppercase tracking-[0.16em] text-cyan-300/70">{currentUser?.role || "agent"}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">Name</label>
              <input className="field mt-1" id="name" name="name" value={form.name} onChange={updateField} required />
            </div>
            <div>
              <label className="label" htmlFor="email">Gmail / Email</label>
              <input className="field mt-1" id="email" name="email" type="email" value={form.email} onChange={updateField} required />
            </div>
            <div>
              <label className="label" htmlFor="phone">Mobile Number</label>
              <input className="field mt-1" id="phone" name="phone" value={form.phone} onChange={updateField} placeholder="Phone number" />
            </div>
            <div>
              <label className="label" htmlFor="password">New Password</label>
              <input className="field mt-1" id="password" name="password" type="password" value={form.password} onChange={updateField} placeholder="Leave blank to keep current" />
            </div>
            {form.password ? (
              <div>
                <label className="label" htmlFor="passwordOtp">Password OTP</label>
                <div className="mt-1 flex gap-2">
                  <input className="field" id="passwordOtp" name="passwordOtp" value={form.passwordOtp} onChange={updateField} placeholder="Enter OTP before saving password" />
                  <button className="btn-secondary shrink-0" type="button" onClick={requestPasswordOtp}>
                    Send OTP
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">OTP is sent to your email and registered mobile number when configured.</p>
              </div>
            ) : null}
            <div className="md:col-span-2 flex justify-end">
              <button className="btn-primary" type="submit" disabled={saving}>
                <Save size={16} />
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="panel p-6">
        <div className="mb-4 flex items-center gap-2">
          <Mail size={18} className="text-cyan-300" />
          <h3 className="text-lg font-bold text-ink">Current Access</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-cyan-300">
              <Mail size={18} />
              <p className="text-sm font-bold uppercase tracking-wide">Email</p>
            </div>
            <p className="break-all text-sm text-slate-500">{form.email || "Not available"}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-cyan-300">
              <ShieldCheck size={18} />
              <p className="text-sm font-bold uppercase tracking-wide">Access Role</p>
            </div>
            <p className="capitalize text-sm text-slate-500">{currentUser?.role || "agent"}</p>
          </div>
        </div>
      </section>

      {canAssignAgents ? (
        <section className="panel p-6">
          <div className="mb-4 flex items-center gap-2">
            <Users size={20} className="text-cyan-300" />
            <h3 className="text-lg font-bold text-ink">Assign Agents To Managers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Agent</th>
                  <th className="px-3 py-2">Customers</th>
                  <th className="px-3 py-2">Manager</th>
                </tr>
              </thead>
              <tbody>
                {(team.agents || []).map((agent) => (
                  <tr key={agent._id} className="border-b border-slate-100">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-ink">{agent.name}</p>
                      <p className="text-xs text-slate-500">{agent.email}</p>
                    </td>
                    <td className="px-3 py-3">{agent.customerCount}</td>
                    <td className="px-3 py-3">
                      <select
                        className="field"
                        value={agent.manager?._id || agent.manager || ""}
                        onChange={(event) => assignManager(agent._id, event.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {(team.managers || []).map((manager) => (
                          <option key={manager._id} value={manager._id}>
                            {manager.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {!team.agents?.length ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-slate-500" colSpan="3">No agents available.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default Profile;

import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";

const ResetPassword = ({ onAuth }) => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      setMessage(data.message || "Password reset successfully");
      if (data.token) {
        onAuth(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell items-center justify-center px-4 py-10">
      <form onSubmit={submit} className="auth-card max-w-md">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-cyan-50 text-brand shadow-sm">
            <ShieldCheck size={25} />
          </div>
          <div>
            <p className="label">Account recovery</p>
            <h1 className="text-3xl font-bold text-ink">Reset password</h1>
          </div>
        </div>

        {error ? <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        {message ? <div className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div> : null}

        <label className="label" htmlFor="password">
          New password
        </label>
        <div className="relative mt-1">
          <input className="field pr-12" id="password" type={showPassword ? "text" : "password"} minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
          <button
            type="button"
            className="absolute right-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/10 text-cyan-100 transition hover:bg-cyan-400/20 hover:text-cyan-200"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">Use 8+ characters with uppercase, lowercase, number, and special character.</p>

        <button className="btn-primary mt-6 w-full" type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset password"}
        </button>
        <Link className="mt-5 block text-center text-sm font-semibold text-brand hover:underline" to="/login">
          Back to sign in
        </Link>
      </form>
    </div>
  );
};

export default ResetPassword;

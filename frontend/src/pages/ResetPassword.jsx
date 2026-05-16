import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";

const ResetPassword = ({ onAuth }) => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            className="field mt-1"
            id="password"
            type={showPassword ? "text" : "password"}
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            style={{ paddingRight: "40px" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
              padding: "6px",
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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

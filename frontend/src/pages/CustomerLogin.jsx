import { Eye, EyeOff, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import AnimatedAuthBackground from "../components/AnimatedAuthBackground.jsx";
import { saveCustomerUser } from "../utils/authStorage.js";

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/customer-portal/login", form);
      saveCustomerUser(data);
      navigate("/customer-portal", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-visual-shell relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8 text-white">
      <AnimatedAuthBackground />

      <div className="relative z-10 mb-7 flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/30 bg-cyan-400/10 shadow-lg shadow-cyan-950/30">
          <img src="/drivesure-logo.png" alt="DriveSure Customer Portal" className="h-14 w-14 object-contain" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
          Customer portal
        </p>
      </div>

      <section className="relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-8 shadow-[0_40px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:px-8">
        <div className="absolute left-[20%] right-[20%] top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />

        <div className="mb-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cyan-400/25 bg-cyan-400/10">
              <img src="/drivesure-logo.png" alt="DriveSure" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-cyan-300">
                Welcome back
              </p>
              <h1 className="text-2xl font-bold leading-none text-white">Customer sign in</h1>
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-white/40">
            Access your policy documents, claim tracking, premium receipts, and service requests.
          </p>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-3">
          <Sparkles size={16} className="mt-0.5 shrink-0 text-cyan-300" strokeWidth={1.6} />
          <p className="text-sm leading-6 text-cyan-100/80">
            Use the email and portal password created by your insurance office.
          </p>
        </div>

        {error ? (
          <div className="mb-5 rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-white/50" htmlFor="customer-email">
              Email address
            </label>
            <input
              className="customer-login-field w-full rounded-lg border border-white/12 bg-transparent px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/60 focus:bg-white/[0.035]"
              id="customer-email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-white/50" htmlFor="customer-password">
              Password
            </label>
            <div className="relative">
              <input
                className="customer-login-field w-full rounded-lg border border-white/12 bg-transparent px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/60 focus:bg-white/[0.035]"
                id="customer-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={updateField}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/10 text-cyan-100 transition hover:bg-cyan-400/20"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
              </button>
            </div>
          </div>

          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/35">
          Company user?{" "}
          <Link to="/login" className="font-semibold text-cyan-300 hover:underline">
            Staff sign in
          </Link>
        </p>

        <div className="absolute bottom-0 left-[30%] right-[30%] h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
      </section>
    </div>
  );
};

export default CustomerLogin;

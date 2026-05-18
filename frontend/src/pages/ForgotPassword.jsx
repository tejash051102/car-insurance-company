import { ArrowLeft, KeyRound, MailCheck, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setResetUrl("");
    setError("");

    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message);
      setResetUrl(data.resetUrl || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell items-center justify-center px-4 py-10">
      <form onSubmit={submit} className="auth-card max-w-[460px]">
        <div className="mb-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-purple-100">
            <ShieldCheck size={14} />
            Secure recovery
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-purple-300/20 bg-purple-400/15 text-purple-100 shadow-lg shadow-purple-950/30">
              <KeyRound size={26} />
            </div>
            <div>
              <p className="label">Account recovery</p>
              <h1 className="text-3xl font-black text-white">Forgot password</h1>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-white/52">
            Enter your staff email address and we will send a secure reset link. The link expires automatically for account safety.
          </p>
        </div>

        {error ? <div className="mb-4 rounded-md border border-red-300/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}
        {message ? (
          <div className="mb-4 rounded-md border border-emerald-300/20 bg-emerald-400/10 px-3 py-3 text-sm text-emerald-100">
            <p className="flex items-center gap-2 font-semibold">
              <MailCheck size={16} />
              {message}
            </p>
            {resetUrl ? (
              <a className="mt-3 inline-block rounded-full border border-emerald-300/20 px-4 py-1.5 text-xs font-bold text-emerald-100 transition hover:bg-emerald-300/10" href={resetUrl}>
                Reset password now
              </a>
            ) : null}
          </div>
        ) : null}

        <label className="label" htmlFor="email">
          Email
        </label>
        <input className="field mt-2" id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" required />

        <button className="btn-primary mt-6 w-full" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
        <Link className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-purple-200 transition hover:text-white" to="/login">
          <ArrowLeft size={16} />
          Back to sign in
        </Link>
      </form>
    </div>
  );
};

export default ForgotPassword;

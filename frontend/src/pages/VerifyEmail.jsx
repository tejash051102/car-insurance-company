import { MailCheck, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";

const VerifyEmail = ({ onAuth }) => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await api.get(`/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(data.message || "Email verified successfully");

        if (data.token) {
          onAuth(data);
        }
      } catch (err) {
        setStatus("error");
        setMessage(err.message);
      }
    };

    verify();
  }, [onAuth, token]);

  return (
    <div className="auth-shell items-center justify-center px-4 py-10">
      <section className="auth-card max-w-lg text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-cyan-50 text-brand shadow-sm">
          {status === "success" ? <ShieldCheck size={30} /> : <MailCheck size={30} />}
        </div>
        <p className="label mt-6">Email verification</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          {status === "loading" ? "One moment" : status === "success" ? "Email verified" : "Verification failed"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>

        {status === "loading" ? (
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-brand" />
          </div>
        ) : (
          <Link className="btn-primary mt-6 inline-flex w-full justify-center" to="/login">
            Go to sign in
          </Link>
        )}
      </section>
    </div>
  );
};

export default VerifyEmail;

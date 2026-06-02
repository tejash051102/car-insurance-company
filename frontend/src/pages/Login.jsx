import { BadgeIndianRupee, Car, ClipboardCheck, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

/* ─── tiny utility: clamp ─── */
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/* ─── Animated canvas background ─── */
function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let w, h;

    /* ── Nodes / edges ── */
    const NODE_COUNT = 55;
    const MAX_DIST = 160;
    let nodes = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const mkNode = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2 + 1,
      pulse: Math.random() * Math.PI * 2,
    });

    const init = () => {
      resize();
      nodes = Array.from({ length: NODE_COUNT }, mkNode);
    };

    /* ── Animated rings ── */
    const RINGS = Array.from({ length: 3 }, (_, i) => ({
      phase: (i / 3) * Math.PI * 2,
      speed: 0.004 + i * 0.002,
    }));

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      /* background gradient */
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#050a14");
      bg.addColorStop(0.5, "#060d1a");
      bg.addColorStop(1, "#04080f");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      /* soft radial glow — centre */
      const glow = ctx.createRadialGradient(w * 0.35, h * 0.5, 0, w * 0.35, h * 0.5, w * 0.55);
      glow.addColorStop(0, "rgba(14,165,233,0.07)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      /* secondary glow */
      const glow2 = ctx.createRadialGradient(w * 0.8, h * 0.3, 0, w * 0.8, h * 0.3, w * 0.4);
      glow2.addColorStop(0, "rgba(99,102,241,0.06)");
      glow2.addColorStop(1, "transparent");
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, w, h);

      /* animated rings */
      RINGS.forEach((ring) => {
        const cx = w * 0.35;
        const cy = h * 0.5;
        const rad = 120 + Math.sin(t * ring.speed + ring.phase) * 40 + RINGS.indexOf(ring) * 90;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(14,165,233,${0.04 + Math.sin(t * ring.speed + ring.phase) * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      /* edges */
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(14,165,233,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      /* nodes */
      nodes.forEach((n) => {
        n.pulse += 0.02;
        const pulse = Math.sin(n.pulse) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + pulse * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14,165,233,${0.5 + pulse * 0.4})`;
        ctx.fill();

        /* move */
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.x = clamp(n.x, 0, w);
        n.y = clamp(n.y, 0, h);
      });

      /* grid overlay — very faint */
      const GRID = 60;
      ctx.strokeStyle = "rgba(14,165,233,0.025)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += GRID) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += GRID) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      t++;
      raf = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener("resize", () => { init(); });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

/* ─── Floating badge ─── */
function MetricBadge({ icon: Icon, value, label, color, delay }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    const tid = setTimeout(() => {
      el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, delay);
    return () => clearTimeout(tid);
  }, [delay]);

  return (
    <div ref={ref} style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "6px",
      padding: "20px 16px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "14px",
      backdropFilter: "blur(10px)",
      flex: 1,
      minWidth: 0,
    }}>
      <Icon size={22} color={color} strokeWidth={1.5} />
      <span style={{ fontSize: "20px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em", textAlign: "center" }}>{label}</span>
    </div>
  );
}

/* ─── Input field ─── */
function Field({ label, id, type = "text", name, value, onChange, placeholder, inputMode, maxLength, required, autoFocus }) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const PasswordIcon = showPassword ? EyeOff : Eye;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label htmlFor={id} style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          required={required}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            background: focused ? "rgba(14,165,233,0.06)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${focused ? "rgba(14,165,233,0.5)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: "10px",
            padding: isPassword ? "13px 48px 13px 16px" : "13px 16px",
            fontSize: "15px",
            color: "#fff",
            outline: "none",
            width: "100%",
            transition: "background 0.2s, border-color 0.2s",
            caretColor: "#0ea5e9",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              border: "1px solid rgba(14,165,233,0.24)",
              borderRadius: "8px",
              background: "rgba(14,165,233,0.12)",
              color: showPassword ? "#67e8f9" : "#bae6fd",
              cursor: "pointer",
            }}
          >
            <PasswordIcon size={18} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Login ─── */
const Login = ({ onAuth }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");

  const cardRef = useRef(null);
  const leftRef = useRef(null);

  /* entrance animation */
  useEffect(() => {
    const card = cardRef.current;
    const left = leftRef.current;
    card.style.transform = "translateY(32px) scale(0.97)";
    left.style.transform = "translateX(-24px)";
    const t1 = setTimeout(() => {
      left.style.transition = "transform 0.8s ease";
      left.style.transform = "translateX(0)";
    }, 200);
    const t2 = setTimeout(() => {
      card.style.transition = "transform 0.8s cubic-bezier(0.22,1,0.36,1)";
      card.style.transform = "translateY(0) scale(1)";
    }, 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  /* tilt on mouse move */
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `perspective(900px) rotateY(${dx * 3}deg) rotateX(${-dy * 3}deg)`;
  };
  const handleMouseLeave = () => {
    const card = cardRef.current;
    card.style.transition = "transform 0.6s cubic-bezier(0.22,1,0.36,1)";
    card.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
  };

  const updateField = (e) => setForm((c) => ({ ...c, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setVerificationUrl(""); setVerificationMessage(""); setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      onAuth(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const resendVerification = async () => {
    if (!form.email) { setError("Enter your email address first"); return; }
    setResending(true); setError(""); setVerificationMessage(""); setVerificationUrl("");
    try { const { data } = await api.post("/auth/resend-verification", { email: form.email }); setVerificationMessage(data.message || "Verification email sent"); setVerificationUrl(data.verificationUrl || ""); }
    catch (err) { setError(err.message); }
    finally { setResending(false); }
  };

  const needsVerification = error.toLowerCase().includes("verify your email");

  return (
    <div className="auth-visual-shell" style={{ position: "relative", minHeight: "100vh", display: "flex", overflow: "hidden", fontFamily: "Inter, system-ui, sans-serif" }}>
      <AnimatedBackground />

      {/* ─── LEFT PANEL ─── */}
      <div
        ref={leftRef}
        style={{
          display: "none",
          width: "52%",
          position: "relative",
          zIndex: 1,
          padding: "60px 56px",
          flexDirection: "column",
          justifyContent: "center",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
        className="login-left-panel"
      >
        {/* logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "32px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "14px",
            background: "rgba(14,165,233,0.15)",
            border: "1px solid rgba(14,165,233,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 32px rgba(14,165,233,0.15)",
            overflow: "hidden",
          }}>
            <img src="/favicon.svg" alt="DriveSure" style={{ width: "44px", height: "44px", objectFit: "contain" }} />
          </div>
          <div>
            <p style={{ fontSize: "22px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>DriveSure</p>
            <p style={{ marginTop: "4px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", color: "rgba(103,232,249,0.72)", textTransform: "uppercase" }}>
              Insurance OS
            </p>
          </div>
        </div>

        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", color: "#0ea5e9", textTransform: "uppercase", marginBottom: "14px" }}>
          Secure Operations Console
        </p>

        <h1 style={{ fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 700, lineHeight: 1.15, color: "#fff", marginBottom: "20px", maxWidth: "420px" }}>
          Insurance<br />Management<br />System
        </h1>

        <p style={{ fontSize: "15px", lineHeight: 1.75, color: "rgba(255,255,255,0.5)", maxWidth: "380px", marginBottom: "48px" }}>
          Manage customers, vehicles, policies, claims, and premium payments from one secure operations console.
        </p>

        {/* metric badges */}
        <div style={{ display: "flex", gap: "12px" }}>
          <MetricBadge icon={Car} value="360°" label="Policy view" color="#67e8f9" delay={600} />
          <MetricBadge icon={ClipboardCheck} value="Fast" label="Claim flow" color="#fb923c" delay={750} />
          <MetricBadge icon={BadgeIndianRupee} value="Live" label="Payments" color="#4ade80" delay={900} />
        </div>

        {/* decorative scanning line */}
        <ScanLine />
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        position: "relative",
        zIndex: 1,
      }}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: "40px 36px",
            backdropFilter: "blur(24px)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {/* card header */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "32px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "rgba(14,165,233,0.15)",
              border: "1px solid rgba(14,165,233,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <img src="/favicon.svg" alt="DriveSure" style={{ width: "34px", height: "34px", objectFit: "contain" }} />
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#0ea5e9", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>
                Welcome back
              </p>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                Sign in
              </h2>
            </div>
          </div>

          <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: "28px" }}>
            Access your policies, claims, payments, and reports.
          </p>

          {/* alert — error */}
          {error && (
            <Alert type="error">
              <span>{error}</span>
              {needsVerification && (
                <button
                  type="button"
                  onClick={resendVerification}
                  disabled={resending}
                  style={{ display: "block", marginTop: "8px", fontSize: "12px", fontWeight: 600, color: "#fca5a5", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
                >
                  {resending ? "Sending…" : "Resend verification email"}
                </button>
              )}
            </Alert>
          )}

          {/* alert — success */}
          {verificationMessage && (
            <Alert type="success">
              <span>{verificationMessage}</span>
              {verificationUrl && (
                <a href={verificationUrl} style={{ display: "block", marginTop: "8px", fontSize: "12px", fontWeight: 600, color: "#6ee7b7", textDecoration: "underline" }}>
                  Verify email now →
                </a>
              )}
            </Alert>
          )}

          {/* form */}
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <Field label="Email address" id="email" type="email" name="email" value={form.email} onChange={updateField} required />
            <Field label="Password" id="password" type="password" name="password" value={form.password} onChange={updateField} required />

            {/* submit button */}
            <SubmitButton loading={loading} label="Sign in" />
          </form>

          {/* footer links */}
          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
            <Link
              to="/forgot-password"
              style={{ fontSize: "13px", fontWeight: 500, color: "#0ea5e9", textDecoration: "none" }}
            >
              Forgot password?
            </Link>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: 0 }}>
              New company user?{" "}
              <Link to="/register" style={{ color: "#0ea5e9", fontWeight: 600, textDecoration: "none" }}>
                Create account
              </Link>
            </p>
            <Link to="/customer-login" style={{ fontSize: "13px", fontWeight: 600, color: "#67e8f9", textDecoration: "none" }}>
              Customer sign in
            </Link>
            <Link to="/portfolio" style={{ fontSize: "13px", fontWeight: 600, color: "#c4b5fd", textDecoration: "none" }}>
              View project portfolio
            </Link>
          </div>
        </div>
      </div>

      {/* responsive: show left panel on large screens */}
      <style>{`
        @media (min-width: 900px) {
          .login-left-panel { display: flex !important; }
        }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #081220 inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #0ea5e9 !important;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; }
      `}</style>
    </div>
  );
};

/* ─── Sub-components ─── */

function Alert({ type, children }) {
  const isError = type === "error";
  return (
    <div style={{
      marginBottom: "20px",
      padding: "12px 14px",
      borderRadius: "10px",
      background: isError ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
      border: `1px solid ${isError ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}`,
      fontSize: "13px",
      color: isError ? "#fca5a5" : "#6ee7b7",
      lineHeight: 1.5,
    }}>
      {children}
    </div>
  );
}

function SubmitButton({ loading, label }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        marginTop: "6px",
        width: "100%",
        padding: "14px",
        borderRadius: "12px",
        border: "none",
        background: loading
          ? "rgba(14,165,233,0.3)"
          : hovered
            ? "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)"
            : "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
        color: "#fff",
        fontSize: "14px",
        fontWeight: 600,
        letterSpacing: "0.04em",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "background 0.25s, transform 0.15s, box-shadow 0.25s",
        transform: pressed ? "scale(0.98)" : "scale(1)",
        boxShadow: hovered && !loading
          ? "0 8px 32px rgba(14,165,233,0.35)"
          : "0 4px 16px rgba(14,165,233,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      {loading && <Spinner />}
      {label}
    </button>
  );
}

function Spinner() {
  const ref = useRef(null);
  useEffect(() => {
    let angle = 0;
    let raf;
    const tick = () => {
      angle += 6;
      if (ref.current) ref.current.style.transform = `rotate(${angle}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <svg ref={ref} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ScanLine() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    let pos = 0;
    let dir = 1;
    let raf;
    const tick = () => {
      pos += 0.4 * dir;
      if (pos > 100) dir = -1;
      if (pos < 0) dir = 1;
      if (el) el.style.top = pos + "%";
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", borderRadius: "inherit" }}>
      <div
        ref={ref}
        style={{
          position: "absolute",
          left: 0, right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(14,165,233,0.25), transparent)",
          transition: "none",
        }}
      />
    </div>
  );
}

export default Login;

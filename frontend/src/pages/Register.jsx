import { Eye, EyeOff, ShieldPlus, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter.jsx";

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf, w, h;
    const NODE_COUNT = 60;
    const MAX_DIST = 155;
    let nodes = [];
    let t = 0;

    const ORBITS = Array.from({ length: 4 }, (_, i) => ({
      phase: (i / 4) * Math.PI * 2,
      speed: 0.003 + i * 0.0015,
      radiusBase: 90 + i * 70,
    }));

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const mkNode = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.8 + 0.8,
      pulse: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.7 ? 265 : 199,
    });

    const init = () => {
      resize();
      nodes = Array.from({ length: NODE_COUNT }, mkNode);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#04080f");
      bg.addColorStop(0.6, "#060c18");
      bg.addColorStop(1, "#080510");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const addGlow = (cx, cy, r, color) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, color);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      };
      addGlow(w * 0.15, h * 0.4, w * 0.45, "rgba(14,165,233,0.07)");
      addGlow(w * 0.85, h * 0.6, w * 0.4, "rgba(99,102,241,0.07)");
      addGlow(w * 0.5, h * 0.1, w * 0.35, "rgba(168,85,247,0.04)");

      ORBITS.forEach((orb) => {
        const pulse = Math.sin(t * orb.speed + orb.phase);
        const rad = orb.radiusBase + pulse * 30;
        const alpha = 0.035 + pulse * 0.015;
        const cx = w * 0.5;
        const cy = h * 0.5;

        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(14,165,233,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([4, 12]);
        ctx.lineDashOffset = -t * 0.5;
        ctx.stroke();
        ctx.setLineDash([]);
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.15;
            const mixHue = (nodes[i].hue + nodes[j].hue) / 2;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `hsla(${mixHue},80%,65%,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        n.pulse += 0.018;
        const pulse = Math.sin(n.pulse) * 0.5 + 0.5;

        const gr = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, (n.r + 4) * (1 + pulse));
        gr.addColorStop(0, `hsla(${n.hue},85%,65%,${0.25 * pulse})`);
        gr.addColorStop(1, "transparent");
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(n.x, n.y, (n.r + 4) * (1 + pulse * 0.5), 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + pulse * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${n.hue},85%,70%,${0.7 + pulse * 0.25})`;
        ctx.fill();

        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.x = clamp(n.x, 0, w);
        n.y = clamp(n.y, 0, h);
      });

      const GRID = 56;
      ctx.strokeStyle = "rgba(14,165,233,0.022)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += GRID) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += GRID) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      t++;
      raf = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener("resize", init);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", init); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
    />
  );
}

function Field({ label, id, type = "text", name, value, onChange, required, minLength, hint, children }) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const PasswordIcon = showPassword ? EyeOff : Eye;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label htmlFor={id} style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {label}
      </label>
      {children ?? (
        <div style={{ position: "relative" }}>
          <input
            id={id} name={name} type={inputType} value={value}
            onChange={onChange} required={required} minLength={minLength}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{
              background: focused ? "rgba(14,165,233,0.07)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${focused ? "rgba(14,165,233,0.5)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "10px",
              padding: isPassword ? "12px 46px 12px 14px" : "12px 14px",
              fontSize: "14px",
              color: "#fff", outline: "none", width: "100%",
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
                right: "11px",
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
              <PasswordIcon size={17} strokeWidth={1.8} />
            </button>
          )}
        </div>
      )}
      {hint && <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginTop: "2px" }}>{hint}</p>}
    </div>
  );
}

function SelectField({ label, id, name, value, onChange, options }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label htmlFor={id} style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {label}
      </label>
      <select
        id={id} name={name} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          background: focused ? "rgba(14,165,233,0.07)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${focused ? "rgba(14,165,233,0.5)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: "10px", padding: "12px 14px", fontSize: "14px",
          color: "#fff", outline: "none", width: "100%",
          transition: "background 0.2s, border-color 0.2s",
          cursor: "pointer",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
          paddingRight: "36px",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#0a0f1a", color: "#fff" }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SubmitButton({ loading, label }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type="submit" disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        width: "100%", padding: "14px", borderRadius: "12px", border: "none",
        background: loading
          ? "rgba(14,165,233,0.25)"
          : hovered
          ? "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)"
          : "linear-gradient(135deg, #0284c7 0%, #6d28d9 100%)",
        color: "#fff", fontSize: "14px", fontWeight: 600,
        letterSpacing: "0.04em", cursor: loading ? "not-allowed" : "pointer",
        transition: "background 0.3s, box-shadow 0.3s",
        transform: pressed ? "scale(0.98)" : "scale(1)",
        boxShadow: hovered && !loading
          ? "0 8px 32px rgba(14,165,233,0.4), 0 4px 16px rgba(109,40,217,0.3)"
          : "0 4px 16px rgba(14,165,233,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
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
    let angle = 0, raf;
    const tick = () => { angle += 6; if (ref.current) ref.current.style.transform = `rotate(${angle}deg)`; raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <svg ref={ref} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const ROLE_META = {
  agent:   { color: "#22d3ee", bg: "rgba(34,211,238,0.1)",  border: "rgba(34,211,238,0.2)",  desc: "Day-to-day policy & claim handling" },
  manager: { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)", desc: "Team oversight & report access" },
  admin:   { color: "#fb923c", bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.2)",  desc: "Full system configuration & users" },
};

function RolePill({ role }) {
  const meta = ROLE_META[role] || ROLE_META.agent;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "4px 10px", borderRadius: "20px",
      background: meta.bg, border: `1px solid ${meta.border}`,
      fontSize: "11px", fontWeight: 600, color: meta.color,
      marginTop: "8px",
    }}>
      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
      {meta.desc}
    </div>
  );
}

const Register = ({ onAuth }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "agent" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verification, setVerification] = useState(null);

  const cardRef = useRef(null);
  const headRef = useRef(null);

  useEffect(() => {
    [headRef, cardRef].forEach((ref, i) => {
      const el = ref.current;
      if (!el) return;
      el.style.transform = i === 0 ? "translateY(-16px)" : "translateY(28px) scale(0.97)";
      setTimeout(() => {
        el.style.transition = "transform 0.75s cubic-bezier(0.22,1,0.36,1)";
        el.style.transform = "none";
      }, 200 + i * 150);
    });
  }, []);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const r = card.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    card.style.transform = `perspective(1000px) rotateY(${dx * 2.5}deg) rotateX(${-dy * 2.5}deg)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    card.style.transition = "transform 0.6s cubic-bezier(0.22,1,0.36,1)";
    card.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg)";
  };

  const updateField = (e) => setForm((c) => ({ ...c, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setVerification(null);
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      if (data.isEmailVerified && data.token) {
        onAuth(data);
        return;
      }
      setVerification(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-visual-shell" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px", fontFamily: "Inter, system-ui, sans-serif", overflowX: "hidden" }}>
      <AnimatedBackground />

      <div ref={headRef} style={{ position: "relative", zIndex: 1, marginBottom: "28px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "52px", height: "52px", borderRadius: "14px",
          background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 28px rgba(14,165,233,0.18)",
        }}>
          <img src="/drivesure-logo.png" alt="DriveSure" style={{ width: "42px", height: "42px", objectFit: "contain" }} />
        </div>
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", color: "#0ea5e9", textTransform: "uppercase" }}>
          DriveSure
        </p>
      </div>

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "relative", zIndex: 1,
          width: "100%", maxWidth: "560px",
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "22px",
          padding: "36px 32px 32px",
          backdropFilter: "blur(28px)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >

        <div style={{
          position: "absolute", top: 0, left: "20%", right: "20%", height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(14,165,233,0.5), rgba(139,92,246,0.4), transparent)",
          borderRadius: "1px",
        }} />

        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <ShieldPlus size={20} color="#0ea5e9" strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#0ea5e9", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "2px" }}>
                Company access
              </p>
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                Create an account
              </h1>
            </div>
          </div>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>
            Set up a secure workspace profile to manage policies, claims, and payments.
          </p>
        </div>

        <div style={{
          display: "flex", alignItems: "flex-start", gap: "10px",
          padding: "11px 14px", borderRadius: "10px",
          background: "rgba(14,165,233,0.07)",
          border: "1px solid rgba(14,165,233,0.18)",
          marginBottom: "24px",
        }}>
          <Sparkles size={15} color="#0ea5e9" style={{ flexShrink: 0, marginTop: "1px" }} strokeWidth={1.5} />
          <p style={{ fontSize: "12.5px", color: "rgba(14,165,233,0.9)", lineHeight: 1.55 }}>
            Choose the correct role — it controls which dashboard actions and data you can access.
          </p>
        </div>

        {verification && (
          <div style={{
            marginBottom: "20px", padding: "14px 16px", borderRadius: "12px",
            background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
          }}>
            <p style={{ fontSize: "13.5px", fontWeight: 600, color: "#6ee7b7", marginBottom: "6px" }}>
              Check your email to verify this account.
            </p>
            <p style={{ fontSize: "12.5px", color: "rgba(110,231,183,0.7)", lineHeight: 1.55 }}>
              We sent a verification link to <strong style={{ color: "#6ee7b7" }}>{verification.email}</strong>. You can sign in once verified.
            </p>
            {verification.verificationUrl && (
              <a href={verification.verificationUrl} style={{ display: "inline-block", marginTop: "10px", fontSize: "12.5px", fontWeight: 600, color: "#34d399", textDecoration: "underline" }}>
                Verify email now →
              </a>
            )}
          </div>
        )}

        {error && (
          <div style={{
            marginBottom: "20px", padding: "12px 14px", borderRadius: "10px",
            background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.22)",
            fontSize: "13px", color: "#fca5a5", lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>

            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Full name" id="name" name="name" value={form.name} onChange={updateField} required />
            </div>

            <Field label="Email address" id="email" type="email" name="email" value={form.email} onChange={updateField} required />

            <Field
              label="Password" id="password" type="password" name="password"
              value={form.password} onChange={updateField} required minLength={8}
              hint="8+ chars · uppercase · number · symbol"
            />
            <PasswordStrengthMeter password={form.password} />

            <div style={{ gridColumn: "1 / -1" }}>
              <SelectField
                label="Role" id="role" name="role" value={form.role}
                onChange={updateField}
                options={[
                  { value: "agent",   label: "Agent" },
                  { value: "manager", label: "Manager" },
                  { value: "admin",   label: "Admin" },

                ]}
              />
              <RolePill role={form.role} />
            </div>

          </div>

          <div style={{ marginTop: "26px" }}>
            <SubmitButton loading={loading} label={loading ? "Creating account…" : "Create account"} />
          </div>
        </form>

        <p style={{ marginTop: "22px", textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.32)" }}>
          Already registered?{" "}
          <Link to="/login" style={{ color: "#0ea5e9", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>

        <div style={{
          position: "absolute", bottom: 0, left: "30%", right: "30%", height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(109,40,217,0.35), transparent)",
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, marginTop: "24px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px", alignItems: "center" }}>
        {["Fill details", "Choose role", "Access dashboard"].map((step, i) => (
          <div key={step} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "20px", height: "20px", borderRadius: "50%",
              background: i === 0 ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${i === 0 ? "rgba(14,165,233,0.4)" : "rgba(255,255,255,0.1)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "9px", fontWeight: 700,
              color: i === 0 ? "#0ea5e9" : "rgba(255,255,255,0.25)",
            }}>
              {i + 1}
            </div>
            <span style={{ fontSize: "10px", color: i === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
              {step}
            </span>
            {i < 2 && <div style={{ width: "20px", height: "1px", background: "rgba(255,255,255,0.1)", margin: "0 2px" }} />}
          </div>
        ))}
      </div>

      <style>{`
        input::placeholder { color: rgba(255,255,255,0.18) !important; }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #080e1c inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #0ea5e9 !important;
        }
        select option { background: #0a0f1a; color: #fff; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
};

export default Register;

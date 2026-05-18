const scorePassword = (password = "") => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z\d]/.test(password)) score += 1;
  return score;
};

const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
const colors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#14b8a6"];

const PasswordStrengthMeter = ({ password }) => {
  const score = scorePassword(password);
  const width = `${Math.max(score, password ? 1 : 0) * 20}%`;

  return (
    <div className="mt-2 space-y-1">
      <div className="h-2 overflow-hidden rounded-full bg-slate-200/20">
        <div
          className="h-full rounded-full transition-all"
          style={{ width, backgroundColor: colors[score] }}
        />
      </div>
      <p className="text-xs font-semibold" style={{ color: colors[score] }}>
        Password strength: {labels[score]}
      </p>
    </div>
  );
};

export default PasswordStrengthMeter;

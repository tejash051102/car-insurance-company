const buckets = new Map();

export const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");

  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }

  next();
};

export const authRateLimit = (req, res, next) => {
  const windowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
  const maxAttempts = Number(process.env.AUTH_RATE_LIMIT_MAX || 20);
  const now = Date.now();
  const ip = req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  const key = `${ip}:${req.body?.email || ""}:${req.path}`;
  const current = buckets.get(key) || { count: 0, resetAt: now + windowMs };

  if (current.resetAt <= now) {
    current.count = 0;
    current.resetAt = now + windowMs;
  }

  current.count += 1;
  buckets.set(key, current);

  if (current.count > maxAttempts) {
    res.status(429);
    throw new Error("Too many attempts. Please try again later.");
  }

  next();
};

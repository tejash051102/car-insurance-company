import LoginHistory from "../models/LoginHistory.js";
import SecurityAlert from "../models/SecurityAlert.js";

export const getRequestContext = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  const ipAddress = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(",")[0]?.trim() || req.ip || req.socket?.remoteAddress || "unknown";
  const userAgent = req.headers["user-agent"] || "unknown";

  return {
    ipAddress,
    userAgent,
    device: userAgent.slice(0, 160)
  };
};

export const detectSuspiciousLogin = async ({ user, userModel = "User", req, failedAttempts = 0 }) => {
  const context = getRequestContext(req);
  const flags = [];

  const knownDevice = await LoginHistory.exists({
    user: user?._id,
    userModel,
    status: "success",
    userAgent: context.userAgent
  });

  const knownIp = await LoginHistory.exists({
    user: user?._id,
    userModel,
    status: "success",
    ipAddress: context.ipAddress
  });

  if (!knownDevice) flags.push("new_device");
  if (!knownIp) flags.push("new_ip_or_location");
  if (failedAttempts >= 3) flags.push("too_many_failed_attempts");

  return {
    ...context,
    suspicious: flags.length > 0,
    flags
  };
};

export const recordLoginHistory = async ({ req, user, userModel = "User", email, role, status, reason, suspicious = false, flags = [] }) => {
  const context = getRequestContext(req);
  return LoginHistory.create({
    user: user?._id,
    userModel,
    email,
    role,
    status,
    reason,
    suspicious,
    flags,
    ...context
  });
};

export const createSecurityAlert = async ({ req, user, userModel = "User", type, severity = "medium", message, metadata = {} }) => {
  const context = getRequestContext(req);
  return SecurityAlert.create({
    type,
    severity,
    message,
    user: user?._id,
    userModel,
    actorName: user?.name || user?.fullName || user?.email,
    metadata,
    ...context
  });
};

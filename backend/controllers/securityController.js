import asyncHandler from "express-async-handler";
import ActivityLog from "../models/ActivityLog.js";
import Customer from "../models/Customer.js";
import LoginHistory from "../models/LoginHistory.js";
import SecurityAlert from "../models/SecurityAlert.js";
import User from "../models/User.js";

const permissions = [
  { module: "Dashboard", admin: true, manager: true, agent: true, customer: false },
  { module: "Customers", admin: "all", manager: "team", agent: "own", customer: "own portal profile" },
  { module: "Vehicles", admin: "all", manager: "team", agent: "own customers", customer: "own policies only" },
  { module: "Policies", admin: "all", manager: "team", agent: "own customers", customer: "own policies only" },
  { module: "Claims", admin: "all", manager: "team", agent: "own customers", customer: "submit/view own" },
  { module: "Payments", admin: "all", manager: "team", agent: "own customers", customer: "own receipts" },
  { module: "Users/Assignments", admin: "all managers and agents", manager: "assigned agents", agent: false, customer: false },
  { module: "Audit Logs", admin: true, manager: true, agent: false, customer: false },
  { module: "Security Center", admin: true, manager: true, agent: false, customer: false }
];

export const getSecurityOverview = asyncHandler(async (_req, res) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    totalAlerts,
    highAlerts,
    failedLogins,
    suspiciousLogins,
    lockedStaff,
    lockedCustomers,
    blockedUploads,
    recentAlerts,
    recentLogins,
    auditLogs
  ] = await Promise.all([
    SecurityAlert.countDocuments(),
    SecurityAlert.countDocuments({ severity: { $in: ["high", "critical"] }, resolved: false }),
    LoginHistory.countDocuments({ status: { $in: ["failed", "locked"] }, createdAt: { $gte: since } }),
    LoginHistory.countDocuments({ suspicious: true, createdAt: { $gte: since } }),
    User.countDocuments({ lockUntil: { $gt: new Date() } }),
    Customer.countDocuments({ lockUntil: { $gt: new Date() } }),
    SecurityAlert.countDocuments({ type: "blocked_document_upload" }),
    SecurityAlert.find().sort({ createdAt: -1 }).limit(10),
    LoginHistory.find().sort({ createdAt: -1 }).limit(12),
    ActivityLog.find().populate("actor", "name email role").sort({ createdAt: -1 }).limit(12)
  ]);

  res.json({
    cards: {
      totalAlerts,
      highAlerts,
      failedLogins,
      suspiciousLogins,
      lockedAccounts: lockedStaff + lockedCustomers,
      blockedUploads
    },
    recentAlerts,
    recentLogins,
    auditLogs,
    encryption: [
      "Staff/customer phone numbers",
      "Customer address fields",
      "Vehicle chassis number",
      "Vehicle engine number",
      "Policy notes"
    ]
  });
});

export const getLoginHistory = asyncHandler(async (_req, res) => {
  const history = await LoginHistory.find().sort({ createdAt: -1 }).limit(100);
  res.json(history);
});

export const getSecurityAlerts = asyncHandler(async (_req, res) => {
  const alerts = await SecurityAlert.find().sort({ createdAt: -1 }).limit(100);
  res.json(alerts);
});

export const getRbacReport = asyncHandler(async (_req, res) => {
  res.json({
    permissions,
    notes: [
      "Admin can see all managers, agents, customers, reports, audit logs, and security alerts.",
      "Manager can see assigned agents and customers created by self or team agents.",
      "Agent can see only customers and records created under that agent.",
      "Customer can access only the customer portal and their own policy, claim, payment, and profile data."
    ]
  });
});

export const getSecurityScores = asyncHandler(async (_req, res) => {
  const [users, customers, histories, alerts] = await Promise.all([
    User.find().select("name email role failedLoginAttempts lockUntil isEmailVerified lastLoginAt").sort({ role: 1, name: 1 }),
    Customer.find().select("firstName lastName email failedLoginAttempts lockUntil contactVerified lastLoginAt").sort({ firstName: 1 }),
    LoginHistory.find().sort({ createdAt: -1 }).limit(500),
    SecurityAlert.find({ resolved: false }).sort({ createdAt: -1 }).limit(500)
  ]);

  const scoreUser = (entity, model) => {
    const entityHistories = histories.filter((history) => String(history.user) === String(entity._id) && history.userModel === model);
    const entityAlerts = alerts.filter((alert) => String(alert.user) === String(entity._id) && alert.userModel === model);
    const failed = entityHistories.filter((history) => ["failed", "locked"].includes(history.status)).length;
    const suspicious = entityHistories.filter((history) => history.suspicious).length;
    const criticalAlerts = entityAlerts.filter((alert) => ["high", "critical"].includes(alert.severity)).length;

    let score = 100;
    score -= Math.min(failed * 5, 25);
    score -= Math.min(suspicious * 8, 24);
    score -= Math.min(criticalAlerts * 12, 36);
    if (entity.lockUntil && entity.lockUntil > new Date()) score -= 25;
    if (model === "User" && !entity.isEmailVerified) score -= 8;
    if (model === "Customer" && !entity.contactVerified) score -= 8;

    const finalScore = Math.max(score, 0);
    return {
      _id: entity._id,
      name: entity.name || entity.fullName,
      email: entity.email,
      role: entity.role || "customer",
      model,
      score: finalScore,
      grade: finalScore >= 80 ? "Strong" : finalScore >= 55 ? "Watch" : "Risk",
      failed,
      suspicious,
      criticalAlerts,
      locked: Boolean(entity.lockUntil && entity.lockUntil > new Date())
    };
  };

  const scores = [
    ...users.map((user) => scoreUser(user, "User")),
    ...customers.map((customer) => scoreUser(customer, "Customer"))
  ].sort((a, b) => a.score - b.score);

  res.json({
    average: scores.length ? Math.round(scores.reduce((sum, item) => sum + item.score, 0) / scores.length) : 100,
    risky: scores.filter((item) => item.score < 55).length,
    scores
  });
});

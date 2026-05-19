import asyncHandler from "express-async-handler";
import ActivityLog from "../models/ActivityLog.js";
import Claim from "../models/Claim.js";
import Customer from "../models/Customer.js";
import Payment from "../models/Payment.js";
import Policy from "../models/Policy.js";
import SecurityAlert from "../models/SecurityAlert.js";
import { createReportPdf } from "../utils/reportGenerator.js";

const sendPdf = (res, filename, buffer) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.send(buffer);
};

export const getReportsOverview = asyncHandler(async (_req, res) => {
  const [customers, policies, claims, payments, auditLogs, securityAlerts] = await Promise.all([
    Customer.countDocuments(),
    Policy.countDocuments(),
    Claim.countDocuments(),
    Payment.countDocuments(),
    ActivityLog.countDocuments(),
    SecurityAlert.countDocuments()
  ]);

  res.json({ customers, policies, claims, payments, auditLogs, securityAlerts });
});

export const downloadReport = asyncHandler(async (req, res) => {
  const type = req.params.type;
  const now = new Date().toISOString().slice(0, 10);

  const config = {
    customers: {
      title: "Customer Report",
      filename: `customers-report-${now}.pdf`,
      load: async () => {
        const rows = await Customer.find().sort({ createdAt: -1 }).limit(100);
        return rows.map((customer) => ({
          title: customer.fullName,
          description: `${customer.email} | ${customer.status} | verified: ${customer.contactVerified ? "yes" : "no"}`
        }));
      }
    },
    policies: {
      title: "Policy Report",
      filename: `policies-report-${now}.pdf`,
      load: async () => {
        const rows = await Policy.find().populate("customer").sort({ createdAt: -1 }).limit(100);
        return rows.map((policy) => ({
          title: policy.policyNumber,
          description: `${policy.customer?.fullName || "Customer"} | ${policy.type} | ${policy.status} | premium ${policy.premiumAmount}`
        }));
      }
    },
    claims: {
      title: "Claims Report",
      filename: `claims-report-${now}.pdf`,
      load: async () => {
        const rows = await Claim.find().populate("customer").sort({ createdAt: -1 }).limit(100);
        return rows.map((claim) => ({
          title: claim.claimNumber,
          description: `${claim.customer?.fullName || "Customer"} | ${claim.status} | amount ${claim.claimAmount}`
        }));
      }
    },
    payments: {
      title: "Payments Report",
      filename: `payments-report-${now}.pdf`,
      load: async () => {
        const rows = await Payment.find().populate("customer").sort({ createdAt: -1 }).limit(100);
        return rows.map((payment) => ({
          title: payment.paymentNumber,
          description: `${payment.customer?.fullName || "Customer"} | ${payment.status} | amount ${payment.amount}`
        }));
      }
    },
    audit: {
      title: "Audit Log Report",
      filename: `audit-report-${now}.pdf`,
      load: async () => {
        const rows = await ActivityLog.find().populate("actor", "name email role").sort({ createdAt: -1 }).limit(100);
        return rows.map((log) => ({
          title: `${log.action} ${log.entityType}`,
          description: `${log.actor?.name || "System"} | ${log.message || ""}`
        }));
      }
    },
    security: {
      title: "Security Alerts Report",
      filename: `security-report-${now}.pdf`,
      load: async () => {
        const rows = await SecurityAlert.find().sort({ createdAt: -1 }).limit(100);
        return rows.map((alert) => ({
          title: `${alert.severity} ${alert.type}`,
          description: alert.message
        }));
      }
    }
  };

  if (!config[type]) {
    res.status(404);
    throw new Error("Unknown report type");
  }

  const overview = await getReportCards();
  const rows = await config[type].load();
  const buffer = await createReportPdf({
    title: config[type].title,
    subtitle: `Generated on ${new Date().toLocaleString("en-IN")}`,
    cards: overview,
    rows
  });

  sendPdf(res, config[type].filename, buffer);
});

const getReportCards = async () => {
  const overview = await Promise.all([
    Customer.countDocuments(),
    Policy.countDocuments(),
    Claim.countDocuments(),
    Payment.countDocuments(),
    SecurityAlert.countDocuments()
  ]);

  return [
    { label: "Customers", value: overview[0] },
    { label: "Policies", value: overview[1] },
    { label: "Claims", value: overview[2] },
    { label: "Payments", value: overview[3] },
    { label: "Security Alerts", value: overview[4] }
  ];
};

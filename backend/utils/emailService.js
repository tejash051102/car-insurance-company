import { promises as dns } from "node:dns";
import nodeDns from "node:dns";

// Force Node.js to prefer IPv4 over IPv6
nodeDns.setDefaultResultOrder("ipv4first");

const isPlaceholder = (value = "") =>
  [
    "yourgmail@gmail.com",
    "your_google_app_password",
    "your-email@gmail.com"
  ].includes(value.trim().toLowerCase());

const hasSmtpConfig = () =>
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  !isPlaceholder(process.env.SMTP_USER) &&
  !isPlaceholder(process.env.SMTP_PASS);

export const validateSmtpConfig = () => {
  if (!hasSmtpConfig()) {
    console.log(
      "[email] SMTP not configured. Using dev mode (emails logged to console)"
    );
    return false;
  }

  console.log(
    `[email] SMTP configured: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`
  );

  return true;
};

const getSmtpTargets = async () => {
  const smtpHost = process.env.SMTP_HOST;

  try {
    const { address } = await dns.lookup(smtpHost, {
      family: 4
    });

    console.log(
      `[email:dns] IPv4 resolved ${smtpHost} -> ${address}`
    );

    return [
      {
        host: address,
        servername: smtpHost
      }
    ];
  } catch (error) {
    console.error(
      `[email:dns] Failed to resolve IPv4 for ${smtpHost}: ${error.message}`
    );

    return [
      {
        host: smtpHost,
        servername: smtpHost
      }
    ];
  }
};

const retryEmail = async (transporter, mailOptions, retries = 2) => {
  let lastError;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const result = await transporter.sendMail(mailOptions);

      if (attempt > 1) {
        console.log(
          `[email:retry] Successfully sent after ${attempt - 1} retry attempt(s)`
        );
      }

      return result;
    } catch (error) {
      lastError = error;

      console.warn(
        `[email:retry] Attempt ${attempt} failed: ${error.message}`
      );

      if (attempt < retries + 1) {
        const delay = Math.min(
          1000 * Math.pow(2, attempt - 1),
          5000
        );

        await new Promise((resolve) =>
          setTimeout(resolve, delay)
        );
      }
    }
  }

  throw lastError;
};

const createTransporter = (nodemailer, smtpTarget) =>
  nodemailer.default.createTransport({
    host: smtpTarget.host,
    port: Number(process.env.SMTP_PORT),

    secure: process.env.SMTP_SECURE === "true",

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    family: 4,

    logger: process.env.SMTP_DEBUG === "true",
    debug: process.env.SMTP_DEBUG === "true",

    tls: {
      servername: smtpTarget.servername,
      rejectUnauthorized: false
    }
  });

export const sendEmail = async ({ to, subject, text }) => {
  if (!to) {
    return { skipped: true, reason: "Missing recipient" };
  }

  if (!hasSmtpConfig()) {
    console.log(`[email:dev] ${subject} -> ${to}`);
    console.log(text);
    return { skipped: true, reason: "SMTP not configured" };
  }

  try {
    const nodemailer = await import("nodemailer");
    const smtpTargets = await getSmtpTargets();
    const fromName = process.env.SMTP_FROM_NAME || "DriveSure";
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
    const mailOptions = {
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      text
    };
    let lastError;

    for (const smtpTarget of smtpTargets) {
      const transporter = createTransporter(nodemailer, smtpTarget);

      try {
        return await retryEmail(transporter, mailOptions, 1);
      } catch (error) {
        lastError = error;
        console.warn(`[email:target] Failed via ${smtpTarget.host}: ${error.message}`);
      } finally {
        transporter.close();
      }
    }

    throw lastError || new Error("Email service unavailable");
  } catch (error) {
    const errorMessage = error.message || "Email service unavailable";
    console.error(`[email:failed] ${subject} -> ${to}: ${errorMessage}`);
    console.error("[email:error_details]", {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      hostname: error.hostname,
      message: error.message
    });
    return { skipped: true, reason: errorMessage };
  }
};

export const buildPolicyExpiryMessage = (policy) => {
  const customerName = policy.customer?.fullName || "Customer";
  const endDate = new Date(policy.endDate).toLocaleDateString();

  return {
    to: policy.customer?.email,
    subject: `Policy expiry reminder: ${policy.policyNumber}`,
    text: `Hello ${customerName},\n\nYour policy ${policy.policyNumber} is scheduled to expire on ${endDate}. Please contact the insurance team to renew or review your policy.\n\nDriveSure`
  };
};

export const buildPaymentReceiptMessage = (payment) => ({
  to: payment.customer?.email,
  subject: `Payment receipt: ${payment.paymentNumber}`,
  text: `Hello ${payment.customer?.fullName || "Customer"},\n\nYour payment ${payment.paymentNumber} for policy ${payment.policy?.policyNumber || ""} has been recorded with status ${payment.status}. Amount: ${payment.amount}.\n\nDriveSure`
});

export const buildClaimStatusMessage = (claim) => ({
  to: claim.customer?.email,
  subject: `Claim status update: ${claim.claimNumber}`,
  text: `Hello ${claim.customer?.fullName || "Customer"},\n\nYour claim ${claim.claimNumber} is now marked as ${claim.status}. ${claim.decisionNote || ""}\n\nDriveSure`
});

export default sendEmail;

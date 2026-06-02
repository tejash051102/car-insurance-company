const isPlaceholder = (value = "") =>
  ["yourgmail@gmail.com", "your_google_app_password", "your-email@gmail.com"].includes(value.trim().toLowerCase());

const hasSmtpConfig = () =>
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  !isPlaceholder(process.env.SMTP_USER) &&
  !isPlaceholder(process.env.SMTP_PASS);

export const sendEmail = async ({ to, subject, text }) => {
  if (!to) {
    return { skipped: true, reason: "Missing recipient" };
  }

  if (!hasSmtpConfig()) {
    console.log(`[email:dev] ${subject} -> ${to}`);
    console.log(text);
    return { skipped: true, reason: "SMTP not configured" };
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    family: 4,
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 8000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 8000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 10000),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text
  });
};

export const buildPolicyExpiryMessage = (policy) => {
  const customerName = policy.customer?.fullName || "Customer";
  const endDate = new Date(policy.endDate).toLocaleDateString();

  return {
    to: policy.customer?.email,
    subject: `Policy expiry reminder: ${policy.policyNumber}`,
    text: `Hello ${customerName},\n\nYour policy ${policy.policyNumber} is scheduled to expire on ${endDate}. Please contact the insurance team to renew or review your policy.\n\nInsurance Management System`
  };
};

export const buildPaymentReceiptMessage = (payment) => ({
  to: payment.customer?.email,
  subject: `Payment receipt: ${payment.paymentNumber}`,
  text: `Hello ${payment.customer?.fullName || "Customer"},\n\nYour payment ${payment.paymentNumber} for policy ${payment.policy?.policyNumber || ""} has been recorded with status ${payment.status}. Amount: ${payment.amount}.\n\nInsurance Management System`
});

export const buildClaimStatusMessage = (claim) => ({
  to: claim.customer?.email,
  subject: `Claim status update: ${claim.claimNumber}`,
  text: `Hello ${claim.customer?.fullName || "Customer"},\n\nYour claim ${claim.claimNumber} is now marked as ${claim.status}. ${claim.decisionNote || ""}\n\nInsurance Management System`
});

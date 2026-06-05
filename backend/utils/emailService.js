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
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 20000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 20000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000),
    family: 4,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    const fromName = process.env.SMTP_FROM_NAME || "DriveSure";
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

    return await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      text
    });
  } catch (error) {
    console.warn(`[email:skipped] ${subject} -> ${to}: ${error.message}`);
    return { skipped: true, reason: error.message || "Email service unavailable" };
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

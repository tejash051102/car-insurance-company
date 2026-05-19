const hasSmtpConfig = () =>
  process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;

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

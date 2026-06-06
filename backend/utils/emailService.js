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

  console.log(
    `[email] SMTP_PASS exists: ${!!process.env.SMTP_PASS}`
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

    logger: process.env.SMTP_DEBUG === "true",
    debug: process.env.SMTP_DEBUG === "true",

    tls: {
      servername: smtpTarget.servername,
      rejectUnauthorized: false
    }
  });
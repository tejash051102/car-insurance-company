import asyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../utils/emailService.js";
import generateToken from "../utils/generateToken.js";
import { createSecurityAlert, detectSuspiciousLogin, recordLoginHistory } from "../utils/securityAudit.js";

const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
  role: user.role,
  manager: user.manager,
  isEmailVerified: user.isEmailVerified,
  token: generateToken(user._id)
});

const createVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  return {
    rawToken,
    hashedToken,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
  };
};

const createOtp = () => {
  const otp = crypto.randomInt(100000, 999999).toString();
  return {
    otp,
    hashedOtp: crypto.createHash("sha256").update(otp).digest("hex"),
    expires: new Date(Date.now() + OTP_EXPIRY_MS)
  };
};

const getClientUrl = () => {
  const [clientUrl] = (process.env.CLIENT_URL || "http://localhost:5173").split(",");
  return clientUrl.trim().replace(/\/$/, "");
};

const getClientRouteUrl = (path) => `${getClientUrl()}/#${path.startsWith("/") ? path : `/${path}`}`;

const assertStrongPassword = (password) => {
  if (!strongPasswordPattern.test(password || "")) {
    throw new Error("Password must be at least 8 characters and include uppercase, lowercase, number, and special character");
  }
};

const sendVerificationEmail = async (user, rawToken) => {
  const verificationUrl = getClientRouteUrl(`/verify-email/${rawToken}`);
  const result = await sendEmail({
    to: user.email,
    subject: "Verify your email address",
    text: `Hello ${user.name},\n\nPlease verify your email address for DriveSure:\n${verificationUrl}\n\nThis link expires in 24 hours.\n\nIf you did not create this account, you can ignore this email.`
  });

  return {
    verificationUrl,
    emailSkipped: Boolean(result?.skipped)
  };
};

const sendPasswordResetEmail = async (user, rawToken) => {
  const resetUrl = getClientRouteUrl(`/reset-password/${rawToken}`);
  const result = await sendEmail({
    to: user.email,
    subject: "Reset your password",
    text: `Hello ${user.name},\n\nUse this link to reset your DriveSure password:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you did not request this, you can ignore this email.`
  });

  return {
    resetUrl,
    emailSkipped: Boolean(result?.skipped)
  };
};

const sendPasswordChangeOtpEmail = async (user, otp) => {
  if (user.phone) {
    console.log(`[sms:dev] Password change OTP -> ${user.phone}: ${otp}`);
  }

  const result = await sendEmail({
    to: user.email,
    subject: "Verify password change",
    text: `Hello ${user.name},\n\nYour password change OTP is ${otp}.\n\nThis code expires in 10 minutes. The same OTP can be used for email or registered mobile verification.\n\nIf you did not request this, contact the administrator.`
  });

  return {
    emailSkipped: Boolean(result?.skipped),
    phoneAttempted: Boolean(user.phone)
  };
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, manager } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  assertStrongPassword(password);

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    manager: role === "agent" && manager ? manager : undefined,
    createdBy: req.user?._id,
    isEmailVerified: true,
    emailVerifiedAt: new Date()
  });

  res.status(201).json(userResponse(user));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password +mfaLoginOtpHash +mfaLoginOtpExpires");

  if (!user) {
    await recordLoginHistory({ req, email, status: "failed", reason: "unknown_user" });
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    await recordLoginHistory({ req, user, email: user.email, role: user.role, status: "locked", reason: "account_locked" });
    await createSecurityAlert({
      req,
      user,
      type: "account_locked_login",
      severity: "high",
      message: `Blocked login for locked account ${user.email}`
    });
    res.status(423);
    throw new Error("Account is locked after repeated failed attempts. Try again later or contact admin.");
  }

  if (!(await user.matchPassword(password))) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    if (user.failedLoginAttempts >= LOCKOUT_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCKOUT_MS);
      await createSecurityAlert({
        req,
        user,
        type: "account_lockout",
        severity: "critical",
        message: `${user.email} was locked after ${LOCKOUT_ATTEMPTS} failed login attempts`
      });
    } else if (user.failedLoginAttempts >= 3) {
      await createSecurityAlert({
        req,
        user,
        type: "failed_login_spike",
        severity: "high",
        message: `${user.email} has ${user.failedLoginAttempts} failed login attempts`
      });
    }

    await user.save({ validateBeforeSave: false });
    await recordLoginHistory({
      req,
      user,
      email: user.email,
      role: user.role,
      status: user.lockUntil && user.lockUntil > new Date() ? "locked" : "failed",
      reason: "invalid_password",
      suspicious: user.failedLoginAttempts >= 3,
      flags: user.failedLoginAttempts >= 3 ? ["too_many_failed_attempts"] : []
    });

    res.status(401);
    throw new Error("Invalid email or password");
  }

  const suspicious = await detectSuspiciousLogin({
    user,
    req,
    failedAttempts: user.failedLoginAttempts || 0
  });
  user.mfaLoginOtpHash = undefined;
  user.mfaLoginOtpExpires = undefined;
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();
  user.lastLoginIp = suspicious.ipAddress;
  await user.save({ validateBeforeSave: false });

  await recordLoginHistory({
    req,
    user,
    email: user.email,
    role: user.role,
    status: "success",
    reason: "password_login",
    suspicious: suspicious.suspicious,
    flags: suspicious.flags
  });

  if (suspicious.suspicious) {
    await createSecurityAlert({
      req,
      user,
      type: "suspicious_login",
      severity: suspicious.flags.includes("new_device") ? "high" : "medium",
      message: `Suspicious login detected for ${user.email}`,
      metadata: { flags: suspicious.flags }
    });
  }

  res.json(userResponse(user));
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() }
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    res.status(400);
    throw new Error("Verification link is invalid or expired");
  }

  user.isEmailVerified = true;
  user.emailVerifiedAt = new Date();
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({
    ...userResponse(user),
    message: "Email verified successfully"
  });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.isEmailVerified) {
    res.json({ message: "Email is already verified" });
    return;
  }

  const verification = createVerificationToken();
  user.emailVerificationToken = verification.hashedToken;
  user.emailVerificationExpires = verification.expires;
  await user.save({ validateBeforeSave: false });

  const emailResult = await sendVerificationEmail(user, verification.rawToken);
  res.json({
    message: "Verification email sent",
    ...(emailResult.emailSkipped ? { verificationUrl: emailResult.verificationUrl } : {})
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    res.json({ message: "If this email exists, a reset link has been sent" });
    return;
  }

  const reset = createVerificationToken();
  user.passwordResetToken = reset.hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const emailResult = await sendPasswordResetEmail(user, reset.rawToken);
  res.json({
    message: "If this email exists, a reset link has been sent",
    ...(emailResult.emailSkipped ? { resetUrl: emailResult.resetUrl } : {})
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error("Password is required");
  }

  assertStrongPassword(password);

  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() }
  }).select("+password +passwordResetToken +passwordResetExpires");

  if (!user) {
    res.status(400);
    throw new Error("Reset link is invalid or expired");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({
    ...userResponse(user),
    message: "Password reset successfully"
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password +passwordChangeOtpHash +passwordChangeOtpExpires");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name ?? user.name;
  user.email = req.body.email ?? user.email;
  user.phone = req.body.phone ?? user.phone;

  if (req.body.password) {
    if (!req.body.passwordOtp) {
      res.status(400);
      throw new Error("Password change OTP is required");
    }

    assertStrongPassword(req.body.password);

    const hashedOtp = crypto.createHash("sha256").update(String(req.body.passwordOtp)).digest("hex");
    if (
      !user.passwordChangeOtpHash ||
      user.passwordChangeOtpHash !== hashedOtp ||
      !user.passwordChangeOtpExpires ||
      user.passwordChangeOtpExpires < new Date()
    ) {
      res.status(401);
      throw new Error("Invalid or expired password change OTP");
    }

    user.password = req.body.password;
    user.passwordChangeOtpHash = undefined;
    user.passwordChangeOtpExpires = undefined;

    await createSecurityAlert({
      req,
      user,
      type: "password_changed",
      severity: "medium",
      message: `${user.email} changed staff account password`
    });
  }

  if (req.file) {
    user.avatarUrl = `/uploads/${req.file.filename}`;
  }

  await user.save();
  await createSecurityAlert({
    req,
    user,
    type: "profile_changed",
    severity: "low",
    message: `${user.email} updated staff profile`
  });
  res.json(userResponse(user));
});

export const sendProfilePasswordOtp = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+passwordChangeOtpHash +passwordChangeOtpExpires");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const otp = createOtp();
  user.passwordChangeOtpHash = otp.hashedOtp;
  user.passwordChangeOtpExpires = otp.expires;
  await user.save({ validateBeforeSave: false });

  const emailResult = await sendPasswordChangeOtpEmail(user, otp.otp);
  res.json({
    message: emailResult.emailSkipped
      ? "SMTP is not configured, so use the OTP shown in the app."
      : emailResult.phoneAttempted
        ? "Password change OTP sent to your email and registered mobile number"
        : "Password change OTP sent to your email",
    phoneOtpSent: emailResult.phoneAttempted,
    ...(emailResult.emailSkipped ? { otp: otp.otp } : {})
  });
});

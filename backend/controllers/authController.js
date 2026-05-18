import asyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../utils/emailService.js";
import generateToken from "../utils/generateToken.js";

const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
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
    text: `Hello ${user.name},\n\nPlease verify your email address for Insurance Management System:\n${verificationUrl}\n\nThis link expires in 24 hours.\n\nIf you did not create this account, you can ignore this email.`
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
    text: `Hello ${user.name},\n\nUse this link to reset your Insurance Management System password:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you did not request this, you can ignore this email.`
  });

  return {
    resetUrl,
    emailSkipped: Boolean(result?.skipped)
  };
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

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
    isEmailVerified: true,
    emailVerifiedAt: new Date()
  });

  res.status(201).json(userResponse(user));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
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

  try {
    const emailResult = await sendVerificationEmail(user, verification.rawToken);
    res.json({
      message: "Verification email sent",
      ...(emailResult.emailSkipped ? { verificationUrl: emailResult.verificationUrl } : {})
    });
  } catch (emailError) {
    console.error("Verification email error:", emailError.message);
    res.json({
      message: "Verification email sent",
      verificationUrl: emailResult.verificationUrl
    });
  }
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

  try {
    const emailResult = await sendPasswordResetEmail(user, reset.rawToken);
    res.json({
      message: "If this email exists, a reset link has been sent",
      ...(emailResult.emailSkipped ? { resetUrl: emailResult.resetUrl } : {})
    });
  } catch (emailError) {
    console.error("Password reset email error:", emailError.message);
    res.json({
      message: "If this email exists, a reset link has been sent",
      resetUrl: getClientRouteUrl(`/reset-password/${reset.rawToken}`)
    });
  }
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

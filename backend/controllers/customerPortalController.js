import asyncHandler from "express-async-handler";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Claim from "../models/Claim.js";
import Customer from "../models/Customer.js";
import Payment from "../models/Payment.js";
import Policy from "../models/Policy.js";
import { sendEmail } from "../utils/emailService.js";
import { createInvoicePdf } from "../utils/invoiceGenerator.js";
import { createPolicyPdf } from "../utils/pdfGenerator.js";
import { createSecurityAlert, detectSuspiciousLogin, recordLoginHistory } from "../utils/securityAudit.js";

const generateCustomerToken = (id) =>
  jwt.sign({ id, type: "customer" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

const customerResponse = (customer) => ({
  _id: customer._id,
  firstName: customer.firstName,
  lastName: customer.lastName,
  fullName: customer.fullName,
  email: customer.email,
  phone: customer.phone,
  avatarUrl: customer.avatarUrl,
  address: customer.address,
  status: customer.status,
  contactVerified: customer.contactVerified,
  token: generateCustomerToken(customer._id)
});

const generateClaimNumber = () => `CLM-${Date.now().toString().slice(-8)}`;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const createOtp = () => {
  const otp = crypto.randomInt(100000, 999999).toString();
  return {
    otp,
    hashedOtp: crypto.createHash("sha256").update(otp).digest("hex"),
    expires: new Date(Date.now() + OTP_EXPIRY_MS)
  };
};

const sendPasswordChangeOtpEmail = async (customer, otp) => {
  if (customer.phone) {
    console.log(`[sms:dev] Customer password change OTP -> ${customer.phone}: ${otp}`);
  }

  const result = await sendEmail({
    to: customer.email,
    subject: "Verify customer password change",
    text: `Hello ${customer.fullName},\n\nYour customer portal password change OTP is ${otp}.\n\nThis code expires in 10 minutes. The same OTP can be used for email or registered mobile verification.\n\nIf you did not request this, contact support.`
  });

  return { emailSkipped: Boolean(result?.skipped), phoneAttempted: Boolean(customer.phone) };
};

export const loginCustomer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const customer = await Customer.findOne({ email }).select("+password");

  if (!customer?.password) {
    res.status(401);
    throw new Error("Customer portal is not enabled for this email");
  }

  if (customer.status !== "active") {
    res.status(403);
    throw new Error("This customer account is inactive");
  }

  if (customer.lockUntil && customer.lockUntil > new Date()) {
    await recordLoginHistory({
      req,
      user: customer,
      userModel: "Customer",
      email: customer.email,
      role: "customer",
      status: "locked",
      reason: "customer_account_locked"
    });
    await createSecurityAlert({
      req,
      user: customer,
      userModel: "Customer",
      type: "customer_account_locked_login",
      severity: "high",
      message: `Blocked login for locked customer account ${customer.email}`
    });
    res.status(423);
    throw new Error("Customer account is locked after repeated failed attempts. Try again later.");
  }

  if (await customer.matchPassword(password)) {
    const suspicious = await detectSuspiciousLogin({
      user: customer,
      userModel: "Customer",
      req,
      failedAttempts: customer.failedLoginAttempts || 0
    });
    customer.failedLoginAttempts = 0;
    customer.lockUntil = undefined;
    customer.lastLoginAt = new Date();
    customer.lastLoginIp = suspicious.ipAddress;
    await customer.save({ validateBeforeSave: false });

    await recordLoginHistory({
      req,
      user: customer,
      userModel: "Customer",
      email: customer.email,
      role: "customer",
      status: "success",
      reason: "customer_login",
      suspicious: suspicious.suspicious,
      flags: suspicious.flags
    });

    if (suspicious.suspicious) {
      await createSecurityAlert({
        req,
        user: customer,
        userModel: "Customer",
        type: "suspicious_customer_login",
        severity: "medium",
        message: `Suspicious customer portal login for ${customer.email}`,
        metadata: { flags: suspicious.flags }
      });
    }

    res.json(customerResponse(customer));
    return;
  }

  customer.failedLoginAttempts = (customer.failedLoginAttempts || 0) + 1;
  if (customer.failedLoginAttempts >= LOCKOUT_ATTEMPTS) {
    customer.lockUntil = new Date(Date.now() + LOCKOUT_MS);
    await createSecurityAlert({
      req,
      user: customer,
      userModel: "Customer",
      type: "customer_account_lockout",
      severity: "critical",
      message: `${customer.email} customer account was locked after ${LOCKOUT_ATTEMPTS} failed login attempts`
    });
  }
  await customer.save({ validateBeforeSave: false });
  await recordLoginHistory({
    req,
    user: customer,
    userModel: "Customer",
    email: customer.email,
    role: "customer",
    status: customer.lockUntil && customer.lockUntil > new Date() ? "locked" : "failed",
    reason: "invalid_customer_password",
    suspicious: customer.failedLoginAttempts >= 3,
    flags: customer.failedLoginAttempts >= 3 ? ["too_many_failed_attempts"] : []
  });

  res.status(401);
  throw new Error("Invalid customer email or password");
});

export const getCustomerProfile = asyncHandler(async (req, res) => {
  res.json(req.customer);
});

export const updateCustomerProfile = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer._id).select("+password +passwordChangeOtpHash +passwordChangeOtpExpires");

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  customer.firstName = req.body.firstName ?? customer.firstName;
  customer.lastName = req.body.lastName ?? customer.lastName;
  customer.email = req.body.email ?? customer.email;
  customer.phone = req.body.phone ?? customer.phone;
  customer.address = {
    ...customer.address?.toObject?.() || customer.address || {},
    street: req.body.street ?? customer.address?.street,
    city: req.body.city ?? customer.address?.city,
    state: req.body.state ?? customer.address?.state,
    zipCode: req.body.zipCode ?? customer.address?.zipCode
  };

  if (req.body.password) {
    if (!req.body.passwordOtp) {
      res.status(400);
      throw new Error("Password change OTP is required");
    }

    const hashedOtp = crypto.createHash("sha256").update(String(req.body.passwordOtp)).digest("hex");
    if (
      !customer.passwordChangeOtpHash ||
      customer.passwordChangeOtpHash !== hashedOtp ||
      !customer.passwordChangeOtpExpires ||
      customer.passwordChangeOtpExpires < new Date()
    ) {
      res.status(401);
      throw new Error("Invalid or expired password change OTP");
    }

    customer.password = req.body.password;
    customer.passwordChangeOtpHash = undefined;
    customer.passwordChangeOtpExpires = undefined;

    await createSecurityAlert({
      req,
      user: customer,
      userModel: "Customer",
      type: "customer_password_changed",
      severity: "medium",
      message: `${customer.email} changed customer portal password`
    });
  }

  if (req.file) {
    customer.avatarUrl = `/uploads/${req.file.filename}`;
  }

  await customer.save();
  await createSecurityAlert({
    req,
    user: customer,
    userModel: "Customer",
    type: "customer_profile_changed",
    severity: "low",
    message: `${customer.email} updated customer portal profile`
  });
  res.json(customerResponse(customer));
});

export const sendCustomerPasswordOtp = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer._id).select("+passwordChangeOtpHash +passwordChangeOtpExpires");

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  const otp = createOtp();
  customer.passwordChangeOtpHash = otp.hashedOtp;
  customer.passwordChangeOtpExpires = otp.expires;
  await customer.save({ validateBeforeSave: false });

  const emailResult = await sendPasswordChangeOtpEmail(customer, otp.otp);
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

export const getCustomerPolicies = asyncHandler(async (req, res) => {
  const policies = await Policy.find({ customer: req.customer._id })
    .populate("vehicle")
    .sort({ createdAt: -1 });

  res.json(policies);
});

export const getCustomerClaims = asyncHandler(async (req, res) => {
  const claims = await Claim.find({ customer: req.customer._id })
    .populate({
      path: "policy",
      populate: { path: "vehicle" }
    })
    .sort({ createdAt: -1 });

  res.json(claims);
});

export const createCustomerClaim = asyncHandler(async (req, res) => {
  const { policy, incidentDate, claimAmount, description } = req.body;
  const customerPolicy = await Policy.findOne({ _id: policy, customer: req.customer._id });

  if (!customerPolicy) {
    res.status(404);
    throw new Error("Policy not found for this customer");
  }

  const claim = await Claim.create({
    policy: customerPolicy._id,
    customer: req.customer._id,
    incidentDate,
    claimAmount: Number(claimAmount || 0),
    description,
    status: "submitted",
    claimNumber: generateClaimNumber()
  });

  const populatedClaim = await claim.populate("policy");
  res.status(201).json(populatedClaim);
});

export const getCustomerPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ customer: req.customer._id })
    .populate("policy")
    .sort({ paymentDate: -1 });

  res.json(payments);
});

export const downloadCustomerPolicyPdf = asyncHandler(async (req, res) => {
  const policy = await Policy.findOne({ _id: req.params.id, customer: req.customer._id })
    .populate("customer")
    .populate("vehicle");

  if (!policy) {
    res.status(404);
    throw new Error("Policy not found for this customer");
  }

  const pdfBuffer = await createPolicyPdf(policy);
  await createSecurityAlert({
    req,
    user: req.customer,
    userModel: "Customer",
    type: "document_downloaded",
    severity: "low",
    message: `${req.customer.email} downloaded policy PDF ${policy.policyNumber}`
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${policy.policyNumber}.pdf`);
  res.send(pdfBuffer);
});

export const downloadCustomerPaymentInvoice = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ _id: req.params.id, customer: req.customer._id })
    .populate("customer")
    .populate("policy");

  if (!payment) {
    res.status(404);
    throw new Error("Payment not found for this customer");
  }

  const pdfBuffer = await createInvoicePdf(payment);
  await createSecurityAlert({
    req,
    user: req.customer,
    userModel: "Customer",
    type: "document_downloaded",
    severity: "low",
    message: `${req.customer.email} downloaded receipt ${payment.paymentNumber}`
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${payment.paymentNumber}-receipt.pdf`);
  res.send(pdfBuffer);
});

import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import Customer from "../models/Customer.js";
import Vehicle from "../models/Vehicle.js";
import Policy from "../models/Policy.js";
import { sendEmail } from "../utils/emailService.js";
import { sendCsv } from "../utils/csvExporter.js";
import { logActivity } from "../utils/activityLogger.js";
import { getPagination, sendPaginated } from "../utils/pagination.js";

const CUSTOMER_OTP_EXPIRY_MS = 10 * 60 * 1000;

const createCustomerOtp = () => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  return {
    otp,
    hashedOtp,
    expires: new Date(Date.now() + CUSTOMER_OTP_EXPIRY_MS)
  };
};

const sendCustomerOtpEmail = async (customer, otp) => {
  const result = await sendEmail({
    to: customer.email,
    subject: "Verify your customer contact",
    text: `Hello ${customer.fullName},\n\nYour Insurance Management System customer verification code is ${otp}.\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`
  });

  return { skipped: Boolean(result?.skipped) };
};

const createAndSendCustomerOtp = async (customer) => {
  const otp = createCustomerOtp();
  customer.contactVerificationOtpHash = otp.hashedOtp;
  customer.contactVerificationExpires = otp.expires;
  await customer.save({ validateBeforeSave: false });

  const result = await sendCustomerOtpEmail(customer, otp.otp);

  return {
    sent: !result.skipped,
    otp: result.skipped ? otp.otp : undefined,
    skippedReason: result.reason
  };
};

export const getCustomers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { firstName: { $regex: req.query.search, $options: "i" } },
          { lastName: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
          { phone: { $regex: req.query.search, $options: "i" } }
        ]
      }
    : {};

  const { page, limit, skip } = getPagination(req.query);
  await sendPaginated(
    res,
    Customer.find(keyword).sort({ createdAt: -1 }),
    Customer.countDocuments(keyword),
    { page, limit, skip }
  );
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  const [vehicles, policies] = await Promise.all([
    Vehicle.find({ customer: customer._id }).sort({ createdAt: -1 }),
    Policy.find({ customer: customer._id }).populate("vehicle").sort({ createdAt: -1 })
  ]);

  res.json({ ...customer.toObject(), vehicles, policies });
});

export const exportCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find().sort({ createdAt: -1 });

  sendCsv(
    res,
    "customers.csv",
    [
      { label: "Name", value: (customer) => customer.fullName },
      { label: "Email", value: (customer) => customer.email },
      { label: "Phone", value: (customer) => customer.phone },
      { label: "City", value: (customer) => customer.address?.city },
      { label: "Status", value: (customer) => customer.status },
      { label: "Created", value: (customer) => customer.createdAt?.toISOString() }
    ],
    customers
  );
});

export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create({
    ...req.body,
    createdBy: req.user?._id
  });
  const otpResult = await createAndSendCustomerOtp(customer);

  await logActivity({
    req,
    action: "created",
    entityType: "Customer",
    entityId: customer._id,
    message: `Created customer ${customer.fullName}`
  });

  res.status(201).json({
    customer,
    contactOtpSent: otpResult.sent,
    ...(otpResult.otp ? { verificationOtp: otpResult.otp } : {}),
    message: otpResult.sent
      ? "Customer created. Verification code sent to customer email."
      : "Customer created. SMTP is not configured, so use the verification OTP shown in the app."
  });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const update = { ...req.body };

  if (update.password) {
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
  } else {
    delete update.password;
  }

  const customer = await Customer.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true
  });

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  await logActivity({
    req,
    action: "updated",
    entityType: "Customer",
    entityId: customer._id,
    message: `Updated customer ${customer.fullName}`
  });

  res.json(customer);
});

export const uploadCustomerDocuments = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  if (!req.files?.length) {
    res.status(400);
    throw new Error("Please upload at least one document");
  }

  const label = req.body.label || "Customer document";
  const documents = req.files.map((file) => ({
    label,
    url: `/uploads/${file.filename}`,
    originalName: file.originalname,
    uploadedBy: req.user?._id
  }));

  customer.documents.push(...documents);
  await customer.save();

  await logActivity({
    req,
    action: "uploaded",
    entityType: "Customer",
    entityId: customer._id,
    message: `Uploaded ${documents.length} document(s) for ${customer.fullName}`
  });

  res.status(201).json(customer);
});

export const resendCustomerOtp = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id).select("+contactVerificationOtpHash +contactVerificationExpires");

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  if (customer.contactVerified) {
    res.json({ message: "Customer contact is already verified" });
    return;
  }

  const otpResult = await createAndSendCustomerOtp(customer);

  res.json({
    message: otpResult.sent
      ? "Verification code sent to customer email"
      : "SMTP is not configured, so use the verification OTP shown in the app.",
    contactOtpSent: otpResult.sent,
    ...(otpResult.otp ? { verificationOtp: otpResult.otp } : {})
  });
});

export const verifyCustomerOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    res.status(400);
    throw new Error("OTP is required");
  }

  const hashedOtp = crypto.createHash("sha256").update(String(otp)).digest("hex");
  const customer = await Customer.findOne({
    _id: req.params.id,
    contactVerificationOtpHash: hashedOtp,
    contactVerificationExpires: { $gt: new Date() }
  }).select("+contactVerificationOtpHash +contactVerificationExpires");

  if (!customer) {
    res.status(401);
    throw new Error("Invalid or expired customer verification code");
  }

  customer.contactVerified = true;
  customer.contactVerifiedAt = new Date();
  customer.contactVerificationOtpHash = undefined;
  customer.contactVerificationExpires = undefined;
  await customer.save({ validateBeforeSave: false });

  await logActivity({
    req,
    action: "verified",
    entityType: "Customer",
    entityId: customer._id,
    message: `Verified customer contact for ${customer.fullName}`
  });

  res.json(customer);
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const linkedVehicleCount = await Vehicle.countDocuments({ customer: req.params.id });
  const linkedPolicyCount = await Policy.countDocuments({ customer: req.params.id });

  if (linkedVehicleCount || linkedPolicyCount) {
    res.status(400);
    throw new Error("Cannot delete a customer with linked vehicles or policies");
  }

  const customer = await Customer.findByIdAndDelete(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  await logActivity({
    req,
    action: "deleted",
    entityType: "Customer",
    entityId: customer._id,
    message: `Deleted customer ${customer.fullName}`
  });

  res.json({ message: "Customer deleted successfully" });
});

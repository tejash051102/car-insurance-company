import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Policy from "../models/Policy.js";
import { sendEmail } from "../utils/emailService.js";
import { sendCsv } from "../utils/csvExporter.js";
import { logActivity } from "../utils/activityLogger.js";
import { getPagination, sendPaginated } from "../utils/pagination.js";
import { createSecurityAlert } from "../utils/securityAudit.js";

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
    text: `Hello ${customer.fullName},\n\nYour DriveSure customer verification code is ${otp}.\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`
  });

  return { skipped: Boolean(result?.skipped), reason: result?.reason };
};

const createAndSendCustomerOtp = async (customer) => {
  const otp = createCustomerOtp();
  customer.contactVerificationOtpHash = otp.hashedOtp;
  customer.contactVerificationExpires = otp.expires;
  await customer.save({ validateBeforeSave: false });

  const result = await sendCustomerOtpEmail(customer, otp.otp);

  if (result.skipped) {
    const error = new Error(`Verification email could not be sent: ${result.reason || "Email service unavailable"}`);
    error.statusCode = 503;
    error.isEmailDeliveryError = true;
    throw error;
  }

  return {
    sent: true,
    skippedReason: result.reason
  };
};

const scanDocument = (file) => {
  const suspiciousPattern = /(virus|malware|trojan|blocked|\.exe$|\.bat$|\.cmd$|\.js$|\.scr$)/i;
  const blocked = suspiciousPattern.test(file.originalname || "") || suspiciousPattern.test(file.mimetype || "");

  return {
    scanStatus: blocked ? "blocked" : "safe",
    scanMessage: blocked
      ? "Malware scan simulation blocked this file because it matched a risky file pattern"
      : "Malware scan simulation completed. No risky pattern found."
  };
};

const getAccessibleCustomerFilter = async (req, baseFilter = {}) => {
  if (req.user?.role === "admin") {
    return baseFilter;
  }

  const withBaseFilter = (accessFilter) =>
    Object.keys(baseFilter).length ? { $and: [baseFilter, accessFilter] } : accessFilter;
  const admins = await User.find({ role: "admin" }).select("_id");
  const adminIds = admins.map((admin) => admin._id);

  if (req.user?.role === "manager") {
    const agents = await User.find({
      role: "agent",
      $or: [{ manager: req.user._id }, { createdBy: req.user._id }]
    }).select("_id");

    return withBaseFilter({
      $or: [
        { createdBy: { $in: [req.user._id, ...agents.map((agent) => agent._id), ...adminIds] } },
        { createdBy: { $exists: false } },
        { createdBy: null }
      ]
    });
  }

  return withBaseFilter({
    $or: [
      { createdBy: req.user?._id },
      { createdBy: { $in: adminIds } },
      { createdBy: { $exists: false } },
      { createdBy: null }
    ]
  });
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
  const filter = await getAccessibleCustomerFilter(req, keyword);

  const { page, limit, skip } = getPagination(req.query);
  await sendPaginated(
    res,
    Customer.find(filter).populate("createdBy", "name email role").sort({ createdAt: -1 }),
    Customer.countDocuments(filter),
    { page, limit, skip }
  );
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const filter = await getAccessibleCustomerFilter(req, { _id: req.params.id });
  const customer = await Customer.findOne(filter).populate("createdBy", "name email role");

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
  const filter = await getAccessibleCustomerFilter(req);
  const customers = await Customer.find(filter).populate("createdBy", "name email role").sort({ createdAt: -1 });

  await logActivity({
    req,
    action: "downloaded",
    entityType: "Customer",
    message: `Downloaded customer CSV report with ${customers.length} record(s)`
  });

  sendCsv(
    res,
    "customers.csv",
    [
      { label: "Name", value: (customer) => customer.fullName },
      { label: "Email", value: (customer) => customer.email },
      { label: "Phone", value: (customer) => customer.phone },
      { label: "City", value: (customer) => customer.address?.city },
      { label: "Status", value: (customer) => customer.status },
      { label: "Added By", value: (customer) => customer.createdBy?.name || "N/A" },
      { label: "Added By Role", value: (customer) => customer.createdBy?.role || "N/A" },
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
    customer: await customer.populate("createdBy", "name email role"),
    contactOtpSent: otpResult.sent,
    message: "Customer created. Verification code sent to customer email."
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

  const filter = await getAccessibleCustomerFilter(req, { _id: req.params.id });
  const customer = await Customer.findOneAndUpdate(filter, update, {
    new: true,
    runValidators: true
  }).populate("createdBy", "name email role");

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
  const filter = await getAccessibleCustomerFilter(req, { _id: req.params.id });
  const customer = await Customer.findOne(filter);

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
    uploadedBy: req.user?._id,
    ...scanDocument(file)
  }));

  customer.documents.push(...documents);
  await customer.save();

  const blockedCount = documents.filter((document) => document.scanStatus === "blocked").length;
  if (blockedCount) {
    await createSecurityAlert({
      req,
      user: req.user,
      type: "blocked_document_upload",
      severity: "critical",
      message: `${blockedCount} uploaded customer document(s) were blocked by malware scan simulation`,
      metadata: { customerId: customer._id, filenames: documents.map((document) => document.originalName) }
    });
  }

  await logActivity({
    req,
    action: blockedCount ? "blocked_upload" : "uploaded",
    entityType: "Customer",
    entityId: customer._id,
    message: `Uploaded ${documents.length} document(s) for ${customer.fullName}; ${blockedCount} blocked by scan simulation`
  });

  res.status(201).json(customer);
});

export const updateDocumentVerification = asyncHandler(async (req, res) => {
  const allowedStatuses = ["pending", "verified", "rejected", "needs-reupload"];
  const { status, note } = req.body;

  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid document verification status");
  }

  const filter = await getAccessibleCustomerFilter(req, { _id: req.params.id });
  const customer = await Customer.findOne(filter);

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  const document = customer.documents.id(req.params.documentId);

  if (!document) {
    res.status(404);
    throw new Error("Document not found");
  }

  document.verificationStatus = status;
  document.verificationNote = note;
  document.verifiedBy = req.user?._id;
  document.verifiedAt = new Date();
  await customer.save();

  await logActivity({
    req,
    action: "verified",
    entityType: "CustomerDocument",
    entityId: customer._id,
    message: `Marked ${document.originalName || document.label} as ${status}`
  });

  res.json(customer);
});

export const resendCustomerOtp = asyncHandler(async (req, res) => {
  const filter = await getAccessibleCustomerFilter(req, { _id: req.params.id });
  const customer = await Customer.findOne(filter).select("+contactVerificationOtpHash +contactVerificationExpires");

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
    message: "Verification code sent to customer email",
    contactOtpSent: otpResult.sent
  });
});

export const verifyCustomerOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    res.status(400);
    throw new Error("OTP is required");
  }

  const hashedOtp = crypto.createHash("sha256").update(String(otp)).digest("hex");
  const accessFilter = await getAccessibleCustomerFilter(req, { _id: req.params.id });
  const customer = await Customer.findOne({
    ...accessFilter,
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

  const filter = await getAccessibleCustomerFilter(req, { _id: req.params.id });
  const customer = await Customer.findOneAndDelete(filter);

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

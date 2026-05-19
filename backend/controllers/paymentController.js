import asyncHandler from "express-async-handler";
import Payment from "../models/Payment.js";
import Policy from "../models/Policy.js";
import { createInvoicePdf } from "../utils/invoiceGenerator.js";
import { getPagination, sendPaginated } from "../utils/pagination.js";

const generatePaymentNumber = () => `PAY-${Date.now().toString().slice(-8)}`;

export const getPayments = asyncHandler(async (req, res) => {
  const filter = {
    ...(req.query.status ? { status: req.query.status } : {}),
    ...(req.query.search
      ? {
          $or: [
            { paymentNumber: { $regex: req.query.search, $options: "i" } },
            { transactionId: { $regex: req.query.search, $options: "i" } },
            { status: { $regex: req.query.search, $options: "i" } },
            { method: { $regex: req.query.search, $options: "i" } }
          ]
        }
      : {})
  };
  const { page, limit, skip } = getPagination(req.query);

  await sendPaginated(
    res,
    Payment.find(filter).populate("customer").populate("policy").sort({ paymentDate: -1 }),
    Payment.countDocuments(filter),
    { page, limit, skip }
  );
});

export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate("customer").populate("policy");

  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }

  res.json(payment);
});

export const createPayment = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.body.policy);

  if (!policy) {
    res.status(404);
    throw new Error("Policy not found");
  }

  const payment = await Payment.create({
    ...req.body,
    customer: req.body.customer || policy.customer,
    paymentNumber: req.body.paymentNumber || generatePaymentNumber()
  });

  const populatedPayment = await payment.populate(["customer", "policy"]);
  res.status(201).json(populatedPayment);
});

export const updatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate("customer")
    .populate("policy");

  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }

  res.json(payment);
});

export const deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);

  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }

  res.json({ message: "Payment deleted successfully" });
});

export const downloadPaymentInvoice = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate("customer").populate("policy");

  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }

  const pdfBuffer = await createInvoicePdf(payment);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${payment.paymentNumber}-invoice.pdf`);
  res.send(pdfBuffer);
});

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    method: {
      type: String,
      enum: ["cash", "card", "upi", "bank-transfer", "cheque"],
      default: "upi"
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["paid", "pending", "failed", "refunded"],
      default: "pending"
    },
    transactionId: {
      type: String,
      trim: true
    },
    receiptIssuedAt: Date,
    notes: String
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;

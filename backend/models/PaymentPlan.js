import mongoose from "mongoose";

const installmentSchema = new mongoose.Schema(
  {
    dueDate: Date,
    amount: Number,
    status: {
      type: String,
      enum: ["due", "paid", "overdue"],
      default: "due"
    },
    paidAt: Date,
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment"
    }
  },
  { _id: true }
);

const paymentPlanSchema = new mongoose.Schema(
  {
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
    frequency: {
      type: String,
      enum: ["monthly", "quarterly"],
      default: "monthly"
    },
    totalAmount: {
      type: Number,
      required: true
    },
    installments: [installmentSchema],
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active"
    }
  },
  { timestamps: true }
);

const PaymentPlan = mongoose.model("PaymentPlan", paymentPlanSchema);

export default PaymentPlan;

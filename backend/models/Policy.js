import mongoose from "mongoose";
import { encryptedString } from "../utils/fieldCrypto.js";

const policySchema = new mongoose.Schema(
  {
    policyNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true
    },
    type: {
      type: String,
      enum: ["comprehensive", "third-party", "collision", "liability"],
      required: true
    },
    coverageAmount: {
      type: Number,
      required: true,
      min: 0
    },
    premiumAmount: {
      type: Number,
      required: true,
      min: 0
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "pending"
    },
    addOns: [
      {
        name: {
          type: String,
          enum: ["roadside-assistance", "zero-depreciation", "engine-protection", "passenger-cover"]
        },
        premium: {
          type: Number,
          default: 0
        }
      }
    ],
    noClaimBonusPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 50
    },
    cancellation: {
      reason: String,
      refundAmount: Number,
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      cancelledAt: Date
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    approvalNote: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    approvedAt: Date,
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    renewalOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy"
    },
    renewalHistory: [
      {
        renewedPolicy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Policy"
        },
        oldEndDate: Date,
        newStartDate: Date,
        newEndDate: Date,
        premiumAmount: Number,
        noClaimBonusPercent: Number,
        renewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        renewedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    quotation: {
      premiumAmount: Number,
      coverageAmount: Number,
      validUntil: Date,
      generatedAt: Date,
      factors: mongoose.Schema.Types.Mixed
    },
    notes: encryptedString()
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } }
);

const Policy = mongoose.model("Policy", policySchema);

export default Policy;

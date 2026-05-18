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
    notes: encryptedString()
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } }
);

const Policy = mongoose.model("Policy", policySchema);

export default Policy;

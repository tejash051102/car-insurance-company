import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    claimNumber: {
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
    incidentDate: {
      type: Date,
      required: true
    },
    reportedDate: {
      type: Date,
      default: Date.now
    },
    claimAmount: {
      type: Number,
      required: true,
      min: 0
    },
    approvedAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ["submitted", "under-review", "approved", "rejected", "settled"],
      default: "submitted"
    },
    description: {
      type: String,
      required: true
    },
    decisionNote: String,
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    decidedAt: Date,
    documentUrl: String
  },
  { timestamps: true }
);

const Claim = mongoose.model("Claim", claimSchema);

export default Claim;

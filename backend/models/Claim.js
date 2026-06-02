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
      enum: ["submitted", "under-review", "survey-scheduled", "approved", "rejected", "paid", "settled"],
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
    documentUrl: String,
    documents: [
      {
        label: {
          type: String,
          default: "Claim evidence"
        },
        url: String,
        originalName: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    inspection: {
      scheduledAt: Date,
      inspector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      result: {
        type: String,
        enum: ["pending", "passed", "failed", "needs-review"],
        default: "pending"
      },
      report: String
    },
    fraud: {
      score: Number,
      level: {
        type: String,
        enum: ["low", "medium", "high"]
      },
      reasons: [String],
      calculatedAt: Date
    },
    repair: {
      garage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Garage"
      },
      estimateAmount: {
        type: Number,
        default: 0
      },
      status: {
        type: String,
        enum: ["not-started", "estimate-requested", "repairing", "completed", "billed"],
        default: "not-started"
      },
      notes: String
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

const Claim = mongoose.model("Claim", claimSchema);

export default Claim;

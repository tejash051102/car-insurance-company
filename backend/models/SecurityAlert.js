import mongoose from "mongoose";

const securityAlertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userModel"
    },
    userModel: {
      type: String,
      enum: ["User", "Customer"],
      default: "User"
    },
    actorName: String,
    ipAddress: String,
    userAgent: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    resolved: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const SecurityAlert = mongoose.model("SecurityAlert", securityAlertSchema);

export default SecurityAlert;

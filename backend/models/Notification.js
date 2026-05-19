import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["policy", "payment", "claim", "security", "document", "ticket", "system"],
      default: "system"
    },
    severity: {
      type: String,
      enum: ["info", "success", "warning", "critical"],
      default: "info"
    },
    audience: {
      type: String,
      enum: ["staff", "customer", "all"],
      default: "staff"
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
    read: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

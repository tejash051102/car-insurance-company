import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true
    },
    entityType: {
      type: String,
      required: true,
      trim: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    actorName: String,
    ipAddress: String,
    userAgent: String
  },
  { timestamps: true }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;

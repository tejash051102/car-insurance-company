import mongoose from "mongoose";

const backupSnapshotSchema = new mongoose.Schema(
  {
    backupNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["created", "verified", "restored"],
      default: "created"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    restoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    restoredAt: Date,
    collections: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    checksum: {
      type: String,
      required: true
    },
    notes: String
  },
  { timestamps: true }
);

const BackupSnapshot = mongoose.model("BackupSnapshot", backupSnapshotSchema);

export default BackupSnapshot;

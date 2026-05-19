import mongoose from "mongoose";

const loginHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userModel"
    },
    userModel: {
      type: String,
      enum: ["User", "Customer"],
      default: "User"
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    role: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["success", "failed", "locked"],
      required: true
    },
    reason: String,
    ipAddress: String,
    userAgent: String,
    device: String,
    suspicious: {
      type: Boolean,
      default: false
    },
    flags: [String]
  },
  { timestamps: true }
);

const LoginHistory = mongoose.model("LoginHistory", loginHistorySchema);

export default LoginHistory;

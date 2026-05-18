import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { encryptedString } from "../utils/fieldCrypto.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: encryptedString(),
    avatarUrl: {
      type: String,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ["admin", "agent", "manager"],
      default: "agent"
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      select: false
    },
    emailVerificationExpires: {
      type: Date,
      select: false
    },
    emailVerifiedAt: {
      type: Date
    },
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    passwordChangeOtpHash: {
      type: String,
      select: false
    },
    passwordChangeOtpExpires: {
      type: Date,
      select: false
    },
    mfaLoginOtpHash: {
      type: String,
      select: false
    },
    mfaLoginOtpExpires: {
      type: Date,
      select: false
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    lastLoginAt: {
      type: Date
    },
    lastLoginIp: {
      type: String
    }
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;

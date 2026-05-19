import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { encryptedString } from "../utils/fieldCrypto.js";

const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
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
    phone: encryptedString({ required: true }),
    avatarUrl: {
      type: String,
      trim: true
    },
    password: {
      type: String,
      minlength: 6,
      select: false
    },
    dateOfBirth: {
      type: Date
    },
    address: {
      street: encryptedString(),
      city: encryptedString(),
      state: encryptedString(),
      zipCode: encryptedString(),
      country: {
        type: String,
        default: "India"
      }
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    contactVerified: {
      type: Boolean,
      default: false
    },
    contactVerifiedAt: {
      type: Date
    },
    contactVerificationOtpHash: {
      type: String,
      select: false
    },
    contactVerificationExpires: {
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
    documents: [
      {
        label: {
          type: String,
          trim: true,
          default: "Customer document"
        },
        url: {
          type: String,
          required: true
        },
        originalName: String,
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        uploadedAt: {
          type: Date,
          default: Date.now
        },
        scanStatus: {
          type: String,
          enum: ["scanned", "safe", "blocked"],
          default: "scanned"
        },
        scanMessage: {
          type: String,
          default: "Document queued for malware scan simulation"
        },
        verificationStatus: {
          type: String,
          enum: ["pending", "verified", "rejected", "needs-reupload"],
          default: "pending"
        },
        verificationNote: String,
        verifiedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        verifiedAt: Date
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
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
  { timestamps: true }
);

customerSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

customerSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

customerSchema.virtual("fullName").get(function fullName() {
  return `${this.firstName} ${this.lastName}`;
});

const hidePrivateFields = (_doc, ret) => {
  delete ret.password;
  delete ret.contactVerificationOtpHash;
  delete ret.contactVerificationExpires;
  delete ret.passwordChangeOtpHash;
  delete ret.passwordChangeOtpExpires;
  return ret;
};

customerSchema.set("toJSON", { virtuals: true, getters: true, transform: hidePrivateFields });
customerSchema.set("toObject", { virtuals: true, getters: true, transform: hidePrivateFields });

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;

import mongoose from "mongoose";
import { encryptedString } from "../utils/fieldCrypto.js";

const vehicleSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    make: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true
    },
    vehicleType: {
      type: String,
      enum: ["car", "bike", "suv", "truck", "van", "other"],
      default: "car"
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "hybrid", "cng"],
      default: "petrol"
    },
    chassisNumber: encryptedString(),
    engineNumber: encryptedString(),
    value: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;

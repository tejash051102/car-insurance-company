import mongoose from "mongoose";

const garageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    contactPerson: String,
    phone: String,
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    city: String,
    address: String,
    specialties: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    status: {
      type: String,
      enum: ["approved", "inactive", "pending"],
      default: "approved"
    }
  },
  { timestamps: true }
);

const Garage = mongoose.model("Garage", garageSchema);

export default Garage;

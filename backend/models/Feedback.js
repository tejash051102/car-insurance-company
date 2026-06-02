import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer"
    },
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy"
    },
    claim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim"
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportTicket"
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    category: {
      type: String,
      enum: ["claim", "policy", "payment", "support", "overall"],
      default: "overall"
    },
    comment: String
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;

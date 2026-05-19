import mongoose from "mongoose";

const ticketMessageSchema = new mongoose.Schema(
  {
    senderModel: {
      type: String,
      enum: ["User", "Customer"],
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "messages.senderModel",
      required: true
    },
    senderName: String,
    message: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ["policy", "claim", "payment", "document", "security", "general"],
      default: "general"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "waiting-customer", "resolved", "closed"],
      default: "open"
    },
    messages: [ticketMessageSchema]
  },
  { timestamps: true }
);

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

export default SupportTicket;

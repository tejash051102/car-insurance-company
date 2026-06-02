import mongoose from "mongoose";

const messageThreadSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer"
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open"
    },
    messages: [
      {
        senderType: {
          type: String,
          enum: ["user", "customer", "system"],
          default: "user"
        },
        senderName: String,
        body: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

const MessageThread = mongoose.model("MessageThread", messageThreadSchema);

export default MessageThread;

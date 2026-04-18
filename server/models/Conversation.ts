import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    initiatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending"
    },
    conversationId: {
      type: String, // Format: userId1_userId2 (sorted to ensure uniqueness)
      required: true,
      unique: true,
      index: true
    },
    lastMessage: {
      type: String,
      default: ""
    },
    lastMessageTime: {
      type: Date,
      default: null
    },
    initiatorUnreadCount: {
      type: Number,
      default: 0
    },
    recipientUnreadCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);

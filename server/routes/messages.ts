import express from "express";
import { Message } from "../models/Message.js";

const router = express.Router();

// Helper function to create conversation ID (sorted to ensure consistency)
const createConversationId = (userId1, userId2) => {
  const ids = [userId1.toString(), userId2.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
};

// Send a message
router.post("/", async (req, res) => {
  try {
    const { senderId, recipientId, text } = req.body;

    if (!senderId || !recipientId || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const conversationId = createConversationId(senderId, recipientId);

    const message = new Message({
      senderId,
      recipientId,
      text,
      conversationId,
      read: false
    });

    await message.save();
    
    // Populate sender info
    await message.populate("senderId", "fullname username profilePic");
    await message.populate("recipientId", "fullname username profilePic");

    res.json(message);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all conversations for a user (with last message)
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all conversations involving this user
    const messages = await Message.find({
      $or: [{ senderId: userId }, { recipientId: userId }]
    })
      .populate("senderId", "fullname username profilePic")
      .populate("recipientId", "fullname username profilePic")
      .sort({ createdAt: -1 });

    // Group by conversation and get unique conversation partners with last message
    const conversations = {};

    messages.forEach((msg) => {
      const partnerId =
        msg.senderId._id.toString() === userId
          ? msg.recipientId._id.toString()
          : msg.senderId._id.toString();

      if (!conversations[msg.conversationId]) {
        conversations[msg.conversationId] = {
          conversationId: msg.conversationId,
          partnerInfo:
            msg.senderId._id.toString() === userId
              ? msg.recipientId
              : msg.senderId,
          lastMessage: msg.text,
          lastMessageTime: msg.createdAt,
          unreadCount: 0
        };
      }

      // Count unread messages from partner to current user
      if (
        msg.recipientId._id.toString() === userId &&
        !msg.read
      ) {
        conversations[msg.conversationId].unreadCount += 1;
      }
    });

    res.json(Object.values(conversations));
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get messages for a specific conversation
router.get("/conversation/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .populate("senderId", "fullname username profilePic")
      .populate("recipientId", "fullname username profilePic")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: err.message });
  }
});

// Mark message as read
router.put("/:messageId/read", async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );

    res.json(message);
  } catch (err) {
    console.error("Error marking message as read:", err);
    res.status(500).json({ error: err.message });
  }
});

// Mark all messages in conversation as read
router.put("/conversation/:conversationId/read", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    await Message.updateMany(
      { conversationId, recipientId: userId, read: false },
      { read: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error marking conversation as read:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

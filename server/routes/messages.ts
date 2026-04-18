import express from "express";
import { Message } from "../models/Message.js";
import Conversation from "../models/Conversation.js";

const router = express.Router();

// Helper function to create conversation ID (sorted to ensure consistency)
const createConversationId = (userId1, userId2) => {
  const ids = [userId1.toString(), userId2.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
};

// ✅ INITIATE A CONVERSATION (SEND MESSAGE REQUEST)
router.post("/initiate", async (req, res) => {
  try {
    const { senderId, recipientId, initialMessage } = req.body;

    if (!senderId || !recipientId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (senderId === recipientId) {
      return res.status(400).json({ error: "Cannot message yourself" });
    }

    const conversationId = createConversationId(senderId, recipientId);

    // Check if conversation already exists
    let conversation = await Conversation.findOne({ conversationId });

    if (conversation) {
      // If already exists, return the existing conversation
      return res.json(conversation);
    }

    // Create new conversation
    conversation = new Conversation({
      initiatorId: senderId,
      recipientId: recipientId,
      status: "pending",
      conversationId,
      lastMessage: initialMessage || "Message request sent",
      lastMessageTime: new Date()
    });

    await conversation.save();
    await conversation.populate("initiatorId", "fullname username profilePic");
    await conversation.populate("recipientId", "fullname username profilePic");

    res.json(conversation);
  } catch (err) {
    console.error("Error initiating conversation:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ ACCEPT A CONVERSATION REQUEST
router.put("/accept/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    const conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Only the recipient can accept
    if (conversation.recipientId.toString() !== userId) {
      return res.status(403).json({ error: "Only recipient can accept" });
    }

    if (conversation.status !== "pending") {
      return res.status(400).json({ error: "Conversation is not pending" });
    }

    conversation.status = "accepted";
    await conversation.save();
    await conversation.populate("initiatorId", "fullname username profilePic");
    await conversation.populate("recipientId", "fullname username profilePic");

    res.json(conversation);
  } catch (err) {
    console.error("Error accepting conversation:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ REJECT A CONVERSATION REQUEST
router.put("/reject/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    const conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Only the recipient can reject
    if (conversation.recipientId.toString() !== userId) {
      return res.status(403).json({ error: "Only recipient can reject" });
    }

    if (conversation.status !== "pending") {
      return res.status(400).json({ error: "Conversation is not pending" });
    }

    conversation.status = "rejected";
    await conversation.save();

    res.json(conversation);
  } catch (err) {
    console.error("Error rejecting conversation:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ALL PENDING CONVERSATION REQUESTS FOR A USER
router.get("/requests/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await Conversation.find({
      recipientId: userId,
      status: "pending"
    })
      .populate("initiatorId", "fullname username profilePic")
      .populate("recipientId", "fullname username profilePic")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("Error fetching conversation requests:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ SEND A MESSAGE (ONLY ALLOWED IF CONVERSATION IS ACCEPTED)
router.post("/", async (req, res) => {
  try {
    const { senderId, recipientId, text } = req.body;

    if (!senderId || !recipientId || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const conversationId = createConversationId(senderId, recipientId);

    // Check if conversation exists and is accepted
    const conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      return res.status(400).json({ 
        error: "No conversation exists. Please initiate a message request first." 
      });
    }

    if (conversation.status !== "accepted") {
      return res.status(403).json({ 
        error: `Cannot send message. Conversation status: ${conversation.status}` 
      });
    }

    // Create and save message
    const message = new Message({
      senderId,
      recipientId,
      text,
      conversationId,
      read: false
    });

    await message.save();

    // Update conversation with last message info
    conversation.lastMessage = text;
    conversation.lastMessageTime = new Date();
    
    // Update unread count for recipient
    if (conversation.recipientId.toString() === recipientId) {
      conversation.recipientUnreadCount += 1;
    } else {
      conversation.initiatorUnreadCount += 1;
    }

    await conversation.save();

    // Populate sender info
    await message.populate("senderId", "fullname username profilePic");
    await message.populate("recipientId", "fullname username profilePic");

    res.json(message);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ALL CONVERSATIONS FOR A USER (ACCEPTED ONLY)
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get accepted conversations
    const conversations = await Conversation.find({
      $or: [{ initiatorId: userId }, { recipientId: userId }],
      status: "accepted"
    })
      .populate("initiatorId", "fullname username profilePic")
      .populate("recipientId", "fullname username profilePic")
      .sort({ lastMessageTime: -1 });

    res.json(conversations);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET MESSAGES FOR A SPECIFIC CONVERSATION
router.get("/conversation/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.query;

    // Verify user has access to this conversation
    const conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (
      conversation.initiatorId.toString() !== userId &&
      conversation.recipientId.toString() !== userId
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

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

// ✅ MARK MESSAGES AS READ
router.put("/conversation/:conversationId/read", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    // Update message read status
    await Message.updateMany(
      { conversationId, recipientId: userId, read: false },
      { read: true }
    );

    // Update conversation unread count
    const conversation = await Conversation.findOne({ conversationId });

    if (conversation) {
      if (conversation.recipientId.toString() === userId) {
        conversation.recipientUnreadCount = 0;
      } else {
        conversation.initiatorUnreadCount = 0;
      }
      await conversation.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error marking conversation as read:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

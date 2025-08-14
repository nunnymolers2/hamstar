import express from "express";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { authenticate } from "../middlewares/auth.js"; // Your Firebase auth middleware

const router = express.Router();

// Start or get conversation
router.get("/conversation/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user.uid; // From Firebase auth

    // Find conversation between two users
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUser, userId] },
    }).populate("lastMessage");

    if (!conversation) {
      // Create new conversation if none exists
      conversation = new Conversation({
        participants: [currentUser, userId],
      });
      await conversation.save();
    }

    // Get all messages for this conversation
    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ timestamp: 1 });

    res.json({ conversation, messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post("/send", authenticate, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user.uid;

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
      });
      await conversation.save();
    }

    // Create new message
    const message = new Message({
      conversationId: conversation._id,
      senderId,
      receiverId,
      text,
    });

    await message.save();

    // Update conversation's last message
    conversation.lastMessage = message._id;
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user conversations
router.get("/conversations", authenticate, async (req, res) => {
  try {
    const userId = req.user.uid;

    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    })
      .populate("lastMessage")
      .sort({ "lastMessage.timestamp": -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/messages/start-conversation
 * Starts a new conversation between current user and another user
 */
router.post("/start-conversation", authenticate, async (req, res) => {
  try {
    const currentUserId = req.user.uid;
    const { otherUserId } = req.body;

    // Validate input
    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        error: "Other user ID is required",
      });
    }

    // Check if users are the same
    if (currentUserId === otherUserId) {
      return res.status(400).json({
        success: false,
        error: "Cannot message yourself",
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId], $size: 2 },
    }).sort({ updatedAt: -1 });

    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, otherUserId],
      });
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error("Error in start-conversation:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
});

export default router;

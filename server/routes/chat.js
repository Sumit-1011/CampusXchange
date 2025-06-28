const express = require("express");
const router = express.Router();
const Chat = require("../models/chat");
const Message = require("../models/message");
const redisClient = require("../utils/redisClient");
const { verifyToken } = require("../middleware/auth");

// Start or retrieve a chat between two users
router.post("/start-chat", verifyToken, async (req, res) => {
  let { user1Id, user2Id } = req.body;

  try {
    // Handle nested IDs if provided
    if (typeof user1Id === "object" && user1Id._id) {
      user1Id = String(user1Id._id);
    }
    if (typeof user2Id === "object" && user2Id.userId && user2Id.userId._id) {
      user2Id = String(user2Id.userId._id);
    }

    // Log the input IDs for debugging
    console.log("User1 ID:", user1Id);
    console.log("User2 ID:", user2Id);

    // Validate IDs
    if (!user1Id || !user2Id) {
      return res.status(400).json({
        status: "error",
        message: "Both user1Id and user2Id are required",
      });
    }

    // Ensure consistent order for participants
    const participants = [user1Id, user2Id].sort();
    //console.log("Participants (sorted):", participants);

    // Check if a chat already exists
    let chat = await Chat.findOne({ participants });

    if (!chat) {
      // Create a new chat if it doesn't exist
      chat = new Chat({ participants });
      await chat.save();
      //console.log("New chat created:", chat);
    } else {
      //console.log("Existing chat found:", chat);
    }

    res.status(200).json({ status: "ok", chat });
  } catch (error) {
    console.error("Error starting or retrieving chat:", error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(409).json({
        status: "error",
        message: "A duplicate chat entry was attempted.",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Could not start or retrieve chat",
    });
  }
});

// Fetch recent messages, first from cache then fallback to MongoDB
router.get("/messages/:chatId", verifyToken, async (req, res) => {
  const { chatId } = req.params;

  try {
    const cacheKey = `chat:${chatId}:recentMessages`;

    // Check for messages in Redis cache
    const cachedMessages = await redisClient.lRange(cacheKey, 0, 9);

    if (cachedMessages && cachedMessages.length > 0) {
      return res.status(200).json({
        status: "ok",
        messages: cachedMessages.map(JSON.parse),
        currentUser: req.user._id,
      });
    }

    // Fetch messages from MongoDB if not found in cache
    const messages = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Return an empty array if no messages are found
    if (!messages || messages.length === 0) {
      return res.status(200).json({
        status: "ok",
        messages: [],
        currentUser: req.user._id,
      });
    }

    // Cache the fetched messages in Redis
    await redisClient.lPush(
      cacheKey,
      ...messages.map((msg) => JSON.stringify(msg))
    );
    await redisClient.expire(cacheKey, 3600);

    return res.status(200).json({
      status: "ok",
      messages,
      currentUser: req.user._id,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while retrieving messages",
    });
  }
});

// Fetch contacts for the authenticated user
router.get("/contacts", verifyToken, async (req, res) => {
  const userId = req.user._id.toString(); // Ensure userId is a string

  try {
    // Find all chats where the user is a participant
    const chats = await Chat.find({
      participants: userId,
    }).populate("participants", "username _id"); // Populate usernames for participants

    const contacts = chats.map((chat) => {
      // Filter out the current user to get the contact
      const contactUser = chat.participants.find(
        (participant) => participant._id.toString() !== userId
      );

      // Check if contactUser exists to avoid accessing undefined properties
      if (!contactUser || !contactUser._id) {
        console.warn(`Chat document is missing a valid contact: ${chat._id}`);
        return null; // Skip if contactUser is missing
      }

      return {
        _id: contactUser._id,
        username: contactUser.username,
        chatId: chat._id,
      };
    });

    // Filter out any null values resulting from missing participants
    res.json({ status: "ok", contacts: contacts.filter(Boolean) });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res
      .status(500)
      .json({ status: "error", message: "Could not retrieve contacts" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Message = require("../models/messageModel");
const authenticateToken = require("../middleware/authMiddleware");

// Get all messages between two users
router.get("/:userId1/:userId2", authenticateToken, async (req, res) => {
  const { userId1, userId2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    }).sort({ createdAt: 1 });

    res.json({ status: "ok", messages });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", error: "Failed to fetch messages" });
  }
});

// Save a new message
router.post("/", authenticateToken, async (req, res) => {
  const { chatId, senderId, receiverId, content } = req.body;

  try {
    const newMessage = new Message({
      chatId,
      senderId,
      receiverId,
      content,
    });

    await newMessage.save();

    res.json({ status: "ok", message: newMessage });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Failed to save message" });
  }
});

module.exports = router;

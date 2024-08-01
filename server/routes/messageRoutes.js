// routes/messageRoutes.js

const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat"); // Make sure you have a Chat model

// Middleware to verify the token
const verifyToken = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store the decoded user information in the request object
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ status: "error", message: "Unauthorized: Invalid token" });
  }
};

// Get messages for a chat
router.get("/:chatId", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId });
    if (!messages) {
      return res.status(404).json({ message: "Messages not found" });
    }
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Send a message
router.post("/createChat", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    // Create new chat
    const newChat = new Chat({ participants: [senderId, receiverId] });
    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).send("Error creating chat");
  }
});

module.exports = router;

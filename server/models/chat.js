// Chat.js (Model)

const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  participants: [String], // Array of user IDs participating in the chat
});

module.exports = mongoose.model("Chat", chatSchema);

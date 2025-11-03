const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  messageUUID: {
    type: String,
    unique: true,
    default: uuidv4, // ✅ Guaranteed unique at creation time
  },
  chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Ensure no duplicate message per chat with same UUID
messageSchema.index({ messageUUID: 1 }, { unique: true });

module.exports = mongoose.model("Message", messageSchema);

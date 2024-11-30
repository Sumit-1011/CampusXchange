const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    updatedAt: { type: Date, default: Date.now },
    participantsKey: { type: String, unique: true }, // Derived unique key
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Pre-save hook to generate a unique key for participants
chatSchema.pre("save", function (next) {
  this.participants = this.participants.sort(); // Ensure consistent order
  this.participantsKey = this.participants.join("_"); // Create a unique key
  next();
});

// Unique index on participantsKey ensures combinations are unique
chatSchema.index({ participantsKey: 1 }, { unique: true });

module.exports = mongoose.model("Chat", chatSchema);

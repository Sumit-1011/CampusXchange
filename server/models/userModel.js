const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 3,
    max: 20,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    max: 50,
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  isAvatarImageSet: {
    type: Boolean,
    default: false,
  },
  avatarImage: {
    type: String,
    default: "",
  },
  cloudinaryPublicId: {
    type: String, // The public_id for the avatar image on Cloudinary
    default: "",
  },
  dateJoined: {
    type: Date,
    default: Date.now, // Sets the default value to the current date and time
  },
});

module.exports = mongoose.model("User", userSchema); // Ensure model name is "User"

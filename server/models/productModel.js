const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  purchaseDateMonth: {
    type: String,
    required: true,
  },
  purchaseDateYear: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true, // Make image optional
  },
  cloudinaryPublicId: {
    type: String, // Store the public_id of the image
    required: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  postedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensure this matches your use case
    },
  },
  likes: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] }, // Initialize likes as an empty array // Add a likes field that stores an array of user IDs
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;

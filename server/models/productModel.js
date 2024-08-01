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
  isApproved: {
    type: Boolean,
    default: true,
  },
  postedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensure this matches your use case
    },
    email: {
      type: String,
      required: true, // Ensure this matches your use case
    },
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;

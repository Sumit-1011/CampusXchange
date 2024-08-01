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
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: true, // Set default value to true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;

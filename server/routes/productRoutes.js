const express = require("express");
const router = express.Router();
const multer = require("multer");
const { verifyToken } = require("../middleware/auth"); // Ensure this is correct
const Product = require("../models/productModel");
const upload = multer({ dest: "uploads/" });

// Middleware to check for authentication
router.use(verifyToken);

// Handle product posting
router.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { price, name, purchaseDateMonth, purchaseDateYear } = req.body;
    const imageUrl = req.file ? req.file.path : "";

    if (!price || !name || !purchaseDateMonth || !purchaseDateYear) {
      return res
        .status(400)
        .json({ status: "error", message: "All fields are required" });
    }

    const newProduct = new Product({
      price,
      name,
      purchaseDateMonth,
      purchaseDateYear,
      image: imageUrl,
      // You can also set postedBy from the authenticated user
      postedBy: req.user._id,
    });

    await newProduct.save();
    res
      .status(200)
      .json({ status: "ok", message: "Product posted successfully" });
  } catch (error) {
    console.error("Error posting product:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

module.exports = router;

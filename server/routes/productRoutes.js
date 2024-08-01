const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const verifyToken = require("../middleware/auth");
const Product = require("../models/productModel");
const upload = multer({ storage: multer.memoryStorage() }); // Store in memory for Cloudinary upload

// Middleware to check for authentication
router.use(verifyToken);

// Handle product posting
router.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { price, name, purchaseDateMonth, purchaseDateYear } = req.body;

    if (!price || !name || !purchaseDateMonth || !purchaseDateYear) {
      return res
        .status(400)
        .json({ status: "error", message: "All fields are required" });
    }

    // Upload image to Cloudinary if available
    let imageUrl = "";
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: "image" }, (error, result) => {
            if (error) {
              return reject(new Error("Cloudinary upload failed"));
            }
            resolve(result);
          })
          .end(req.file.buffer);
      });

      imageUrl = result.secure_url;
    }

    const newProduct = new Product({
      price,
      name,
      purchaseDateMonth,
      purchaseDateYear,
      image: imageUrl, // Image URL or empty string
      postedBy: {
        userId: req.user._id, // Ensure this matches your user object structure
        email: req.user.email, // Ensure this matches your user object structure
      },
      isApproved: true, // Default value
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

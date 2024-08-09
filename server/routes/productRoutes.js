const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const verifyToken = require("../middleware/auth");
const Product = require("../models/productModel");
const User = require("../models/userModel");
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
      try {
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
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return res
          .status(500)
          .json({ status: "error", message: "Image upload failed" });
      }
    }

    const newProduct = new Product({
      price,
      name,
      purchaseDateMonth,
      purchaseDateYear,
      image: imageUrl, // Image URL or empty string
      postedBy: {
        userId: req.user._id, // Ensure this matches your user object structure
      },
      isApproved: true, // Default value
    });

    await newProduct.save();
    res.status(200).json({
      status: "ok",
      message: "Product posted successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error posting product:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Handle fetching products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({
      isApproved: true,
      "postedBy.userId": { $ne: req.user._id },
    }).populate("postedBy.userId", "username");
    res.status(200).json({ status: "ok", products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

module.exports = router;

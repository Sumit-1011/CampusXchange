const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const verifyToken = require("../middleware/auth");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const auth = require("../middleware/auth");
const upload = multer({ storage: multer.memoryStorage() }); // Store in memory for Cloudinary upload

// Middleware to check for authentication
router.use(verifyToken);

// Handle product posting
router.post("/products", auth, upload.single("image"), async (req, res) => {
  try {
    const { price, name, purchaseDateMonth, purchaseDateYear } = req.body;

    if (!price || !name || !purchaseDateMonth || !purchaseDateYear) {
      return res
        .status(400)
        .json({ status: "error", message: "All fields are required" });
    }

    // Upload image to Cloudinary if available
    let imageUrl = "";
    let cloudinaryPublicId = "";
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
        cloudinaryPublicId = result.public_id;
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
      image: imageUrl,
      cloudinaryPublicId: cloudinaryPublicId, // Store the public_id here
      postedBy: {
        userId: req.user._id,
      },
      isApproved: true,
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
router.get("/products", auth, async (req, res) => {
  try {
    const products = await Product.find({
      isApproved: true,
      "postedBy.userId": { $ne: req.user._id },
    })
      .populate("postedBy.userId", "username")
      .lean(); // Use lean() to return plain JS objects

    // Add a likesCount property and isLiked status for each product
    const productsWithLikes = products.map((product) => {
      const likesArray = Array.isArray(product.likes) ? product.likes : [];
      const userIdStr = req.user._id.toString();
      const isLiked = likesArray.map((id) => id.toString()).includes(userIdStr);
      return {
        ...product,
        likesCount: likesArray.length,
        isLiked,
      };
    });

    res.status(200).json({ status: "ok", products: productsWithLikes });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Handle liking/unliking a product
router.post("/products/:id/like", auth, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id; // Get the user ID from the authenticated user

    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }

    const isLiked = product.likes.includes(userId);

    if (isLiked) {
      // Unlike the product
      product.likes.pull(userId);
    } else {
      // Like the product
      product.likes.push(userId);
    }

    await product.save();

    res.status(200).json({
      status: "ok",
      likesCount: product.likes.length,
      isLiked: !isLiked, // This indicates the new state
    });
  } catch (error) {
    console.error("Error liking/unliking product:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Handle product deletion
router.delete("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id; // Ensure this matches your user object structure

    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }

    // Check if the product was posted by the current user
    if (product.postedBy.userId.toString() !== userId.toString()) {
      return res.status(403).json({ status: "error", message: "Unauthorized" });
    }

    // Delete the image from Cloudinary if it exists
    if (product.image) {
      try {
        const imageId = product.image.split("/").pop().split(".")[0]; // Extract the public ID
        await cloudinary.uploader.destroy(imageId);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        return res
          .status(500)
          .json({ status: "error", message: "Image deletion failed" });
      }
    }

    // Delete the product from the database
    await product.deleteOne();

    res.status(200).json({
      status: "ok",
      message: "Product deleted successfully",
      productId,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

module.exports = router;

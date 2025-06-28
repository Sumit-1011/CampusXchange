const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const cloudinary = require("../config/cloudinary");
const redisClient = require("../utils/redisClient"); // Import Redis client
const { verifyAdmin } = require("../middleware/auth");



// Cache key for unapproved products
const UNAPPROVED_PRODUCTS_CACHE_KEY = "unapproved_products";

// Get all unapproved products
router.get("/products", verifyAdmin, async (req, res) => {
  try {
    // Check if data is cached
    const cachedProducts = await redisClient.get(UNAPPROVED_PRODUCTS_CACHE_KEY);

    if (cachedProducts) {
      return res
        .status(200)
        .json({ status: "ok", products: JSON.parse(cachedProducts) });
    }

    // Fetch from the database if not in cache
    const products = await Product.find({ isApproved: false })
      .populate({
        path: "postedBy.userId",
        select: "username email",
      })
      .lean();

    // Cache the result with an expiration time
    await redisClient.set(
      UNAPPROVED_PRODUCTS_CACHE_KEY,
      JSON.stringify(products),
      {
        EX: 900, // Cache expires in 1 hour
      }
    );

    res.status(200).json({ status: "ok", products });
  } catch (error) {
    console.error("Error fetching unapproved products:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Approve a product
router.post("/products/:id/approve", verifyAdmin, async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }

    // Approve the product
    product.isApproved = true;
    await product.save();

    // Invalidate cache
    await redisClient.del(UNAPPROVED_PRODUCTS_CACHE_KEY);

    res.status(200).json({
      status: "ok",
      message: "Product approved successfully",
      product,
    });
  } catch (error) {
    console.error("Error approving product:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Deny (delete) a product
router.delete("/products/:id/deny", verifyAdmin, async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }

    // Delete the image from Cloudinary if it exists
    const cloudinaryPublicIds = [
      product.cloudinaryPublicId,
      product.additionalCloudinaryPublicId1,
      product.additionalCloudinaryPublicId2,
    ].filter(Boolean);

    for (const publicId of cloudinaryPublicIds) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        return res
          .status(500)
          .json({ status: "error", message: "Image deletion failed" });
      }
    }

    // Delete the product from the database
    await product.deleteOne();

    // Invalidate cache
    await redisClient.del(UNAPPROVED_PRODUCTS_CACHE_KEY);

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

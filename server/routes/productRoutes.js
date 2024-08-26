const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const redisClient = require("../utils/redisClient"); // Import your Redis client
const { verifyToken } = require("../middleware/auth");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const auth = require("../middleware/auth");
const upload = multer({ storage: multer.memoryStorage() }); // Store in memory for Cloudinary upload

// Middleware to check for authentication
router.use(verifyToken);

// Handle fetching products
router.get("/products", verifyToken, async (req, res) => {
  try {
    const { sortBy } = req.query;
    const userId = req.user._id.toString();
    const cacheKey = `products_${userId}_${sortBy || "default"}`;

    //console.log("Checking cache for key:", cacheKey);

    // Retrieve from Redis cache
    const cachedProducts = await redisClient.get(cacheKey);
    if (cachedProducts) {
      //console.log("Cache hit for key:", cacheKey);
      return res
        .status(200)
        .json({ status: "ok", products: JSON.parse(cachedProducts) });
    }

    //console.log("Cache miss, querying MongoDB");

    // Query MongoDB
    const products = await Product.find({
      isApproved: true,
      "postedBy.userId": { $ne: req.user._id },
    })
      .populate("postedBy.userId", "username")
      .sort(sortBy === "likes" ? { likesCount: -1 } : { createdAt: -1 })
      .lean();

    const productsWithLikes = products.map((product) => {
      const likesArray = Array.isArray(product.likes) ? product.likes : [];
      const isLiked = likesArray.map((id) => id.toString()).includes(userId);
      return {
        ...product,
        likesCount: likesArray.length,
        isLiked,
      };
    });

    //console.log("Setting cache for key:", cacheKey);

    // Cache the MongoDB result in Redis with expiration time
    await redisClient.set(cacheKey, JSON.stringify(productsWithLikes), {
      EX: 900, // Expire in 15 min
    });

    res.status(200).json({ status: "ok", products: productsWithLikes });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Handle product posting
router.post(
  "/products",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { price, name, purchaseDateMonth, purchaseDateYear, description } =
        req.body;
      const userId = req.user._id;

      if (!price || !name || !purchaseDateMonth || !purchaseDateYear) {
        return res
          .status(400)
          .json({ status: "error", message: "Fill the required fields" });
      }

      // Validate description length
      if (description && description.length > 75) {
        return res.status(400).json({
          status: "error",
          message: "Description must be 75 characters or less",
        });
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
        cloudinaryPublicId,
        postedBy: {
          userId: req.user._id,
        },
        isApproved: false,
        description: description,
      });

      await newProduct.save();

      // Clear relevant cache entries
      const cacheKeys = [
        `products_${userId}_date`,
        `products_${userId}_likes`,
        `products_${userId}_default`,
      ];

      for (const key of cacheKeys) {
        try {
          await redisClient.del(key);
        } catch (error) {
          console.error(`Failed to clear cache for key ${key}`, error);
        }
      }

      // Clear the unapproved products cache
      await redisClient.del("unapproved_products");

      res.status(200).json({
        status: "ok",
        message: "Product posted successfully",
        product: newProduct,
      });
    } catch (error) {
      console.error("Error posting product:", error);
      res.status(500).json({ status: "error", message: "Server error" });
    }
  }
);

// Handle liking/unliking a product
router.post("/products/:id/like", verifyToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }

    const isLiked = product.likes.includes(userId);

    if (isLiked) {
      product.likes.pull(userId);
    } else {
      product.likes.push(userId);
    }

    await product.save();

    // Clear relevant cache entries
    const cacheKeys = [
      `products_${userId}_date`,
      `products_${userId}_likes`,
      `products_${userId}_default`,
    ];

    for (const key of cacheKeys) {
      try {
        await redisClient.del(key);
      } catch (error) {
        console.error(`Failed to clear cache for key ${key}`, error);
      }
    }

    res.status(200).json({
      status: "ok",
      likesCount: product.likes.length,
      isLiked: !isLiked,
    });
  } catch (error) {
    console.error("Error liking/unliking product:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Handle product deletion
router.delete("/products/:id", verifyToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

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
    if (product.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(product.cloudinaryPublicId);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        return res
          .status(500)
          .json({ status: "error", message: "Image deletion failed" });
      }
    }

    // Delete the product from the database
    await product.deleteOne();

    // Clear relevant cache entries
    const cacheKeys = [
      `products_${userId}_date`,
      `products_${userId}_likes`,
      `products_${userId}_default`,
    ];

    for (const key of cacheKeys) {
      try {
        await redisClient.del(key);
      } catch (error) {
        console.error(`Failed to clear cache for key ${key}`, error);
      }
    }

    // Clear the unapproved products cache
    await redisClient.del("unapproved_products");

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

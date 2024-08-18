const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Product = require("../models/productModel"); // Import Product model
const auth = require("../middleware/auth"); // Import auth middleware
const cloudinary = require("../config/cloudinary"); // Import cloudinary configuration
const axios = require("axios");

require("dotenv").config();

// Password validation function
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{6,15}$/;
  return passwordRegex.test(password);
};

// Get products posted by the authenticated user
router.get("/user/products", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const products = await Product.find({ "postedBy.userId": userId });

    res.status(200).json({ status: "ok", products });
  } catch (error) {
    console.error("Error fetching user products:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const token = jwt.sign(
        {
          name: user.username,
          email: user.email,
        },
        process.env.JWT_SECRET
        // { expiresIn: "1h" } // Optional: Set token expiry
      );
      return res.json({ status: "ok", token });
    } else {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "An error occurred" });
  }
});

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, avatarImage } = req.body;

    if (!validatePassword(password)) {
      return res.status(400).json({
        status: "error",
        error:
          "Password must be 6-15 characters long, contain special characters, and include at least one lowercase and one uppercase character.",
      });
    }

    // Upload the avatar image to Cloudinary
    let uploadedImageUrl = "";
    if (avatarImage) {
      const uploadResponse = await cloudinary.uploader.upload(avatarImage, {
        folder: "avatars",
      });
      uploadedImageUrl = uploadResponse.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isAvatarImageSet: !!!uploadedImageUrl,
      avatarImage: uploadedImageUrl || "",
    });

    await newUser.save();

    res.json({ status: "ok", userId: newUser._id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        status: "error",
        error: "Duplicate email or username",
      });
    }
    res.status(500).json({ status: "error", error: "Registration failed" });
  }
});

// Set avatar for a user
router.post("/setAvatar", async (req, res) => {
  const { userId, avatar } = req.body;

  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Upload new avatar to Cloudinary
    const result = await cloudinary.uploader.upload(avatar, {
      folder: "profile",
      resource_type: "image",
    });

    // Update user document
    user.avatarImage = result.secure_url;
    user.cloudinaryPublicId = result.public_id;
    user.isAvatarImageSet = true;

    await user.save();

    res.json({ message: "Avatar updated successfully", user });
  } catch (error) {
    console.error("Error setting avatar:", error);
    res.status(500).json({ error: "Failed to set avatar" });
  }
});

// Get authenticated user data
router.get("/user", async (req, res) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ status: "error", error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ status: "error", error: "User not found" });
    }

    // Get count of products posted by the user
    const productCount = await Product.countDocuments({
      "postedBy.userId": user._id,
    });

    res.json({
      status: "ok",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatarImage: user.avatarImage,
        dateJoined: user.dateJoined,
        productCount, // Add product count
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ status: "error", error: "Invalid token" });
  }
});

// Get Files
router.get("/user/favorites", auth, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming the user ID is stored in the token
    const likedProducts = await Product.find({ likes: userId });
    res.json({ status: "ok", products: likedProducts });
  } catch (error) {
    console.error("Error fetching liked products", error);
    res
      .status(500)
      .json({ status: "error", message: "Error fetching liked products" });
  }
});

//delete the User with its data
router.delete("/user", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user to get their profile image public ID
    const user = await User.findById(userId);

    // Find all products posted by the user
    const products = await Product.find({ "postedBy.userId": userId });

    // Delete the user's profile image from Cloudinary if it exists
    if (user.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(user.cloudinaryPublicId);
    }

    // Delete each product's image from Cloudinary
    for (let product of products) {
      if (product.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(product.cloudinaryPublicId);
      }
    }

    // Remove likes associated with the user
    await Product.updateMany({ likes: userId }, { $pull: { likes: userId } });

    // Delete the user's products from the database
    await Product.deleteMany({ "postedBy.userId": userId });

    // Delete the user from the database
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      status: "ok",
      message: "User account and associated products deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account and products:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
});

// Fetch avatrs and display them as strings
router.get("/avatars", async (req, res) => {
  const apiKey = process.env.MULTI_AVATAR_API;

  try {
    const avatarPromises = Array.from({ length: 5 }).map(async () => {
      const response = await axios.get(
        `https://api.multiavatar.com/${Math.random()}.svg?apikey=${apiKey}`,
        { responseType: "arraybuffer" }
      );

      return `data:image/svg+xml;base64,${Buffer.from(response.data).toString(
        "base64"
      )}`;
    });

    const avatarDataUrls = await Promise.all(avatarPromises);
    res.json(avatarDataUrls);
  } catch (error) {
    console.error("Error fetching avatars:", error);
    res.status(500).json({ error: "Error fetching avatars" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Product = require("../models/productModel"); // Import Product model
const auth = require("../middleware/auth"); // Import auth middleware
const axios = require("axios");

require("dotenv").config();

// Password validation function
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{6,15}$/;
  return passwordRegex.test(password);
};

// Set avatar for a user
router.post("/setAvatar", async (req, res) => {
  const { userId, avatar } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: "error", error: "User not found" });
    }

    user.isAvatarImageSet = true;
    user.avatarImage = avatar;

    await user.save();
    res.json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "An error occurred" });
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

    res.json({
      status: "ok",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatarImage: user.avatarImage,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ status: "error", error: "Invalid token" });
  }
});

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isAvatarImageSet: !!avatarImage,
      avatarImage: avatarImage || "",
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

// Fetch avatars
router.get("/avatars", async (req, res) => {
  const apiKey = process.env.MULTI_AVATAR_API; // API key from environment variable
  try {
    const avatarPromises = Array.from({ length: 5 }).map(() =>
      axios.get(
        `https://api.multiavatar.com/${Math.random()}.svg?apikey=${apiKey}`
      )
    );
    const avatarResponses = await Promise.all(avatarPromises);
    const avatarUrls = avatarResponses.map((response) => response.config.url);
    res.json(avatarUrls);
  } catch (error) {
    res.status(500).json({ error: "Error fetching avatars" });
  }
});

module.exports = router;

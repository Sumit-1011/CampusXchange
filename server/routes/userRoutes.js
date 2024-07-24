const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
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
      return res.json({ status: "error", error: "User not found" });
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

router.get("/user", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.json({ status: "error", error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.json({ status: "error", error: "User not found" });
    }

    res.json({
      status: "ok",
      user: {
        username: user.username,
        email: user.email,
        avatarImage: user.avatarImage,
      },
    });
  } catch (error) {
    res.json({ status: "error", error: "Invalid token" });
  }
});

router.get("/avatars", async (req, res) => {
  const apiKey = process.env.MULTI_AVATAR_API; // API key from environment variable
  try {
    const avatarPromises = Array.from({ length: 5 }).map((_, index) =>
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

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, avatarImage } = req.body;

    // Validate password
    if (!validatePassword(password)) {
      return res.json({
        status: "error",
        error:
          "Password must be 6-15 characters long, contain special characters, and include at least one lowercase and one uppercase character.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isAvatarImageSet: !!avatarImage,
      avatarImage: avatarImage || "",
    });

    // Save the user to the database
    await newUser.save();

    if (!avatarImage) {
      return res.json({ status: "ok", userId: newUser._id });
    }

    res.json({ status: "ok" });
  } catch (err) {
    // Handle duplicate email or username error
    if (err.code === 11000) {
      return res.json({
        status: "error",
        error: "Duplicate email or username",
      });
    }
    res.json({ status: "error", error: "Registration failed" });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const token = jwt.sign(
        {
          name: user.username, // Adjust if needed
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } // Optional: Set token expiry
      );
      return res.json({ status: "ok", token });
    } else {
      return res.json({
        status: "error",
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error(error);
    return res.json({ status: "error", message: "An error occurred" });
  }
});

module.exports = router;

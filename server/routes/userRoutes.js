const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const axios = require("axios");
const sharp = require("sharp");

require("dotenv").config();

// Password validation function
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{6,15}$/;
  return passwordRegex.test(password);
};

// Set avatar for a user
router.post("/setAvatar", async (req, res) => {
  const { userId, avatarUrl } = req.body;

  try {
    const response = await axios.get(avatarUrl);
    const svgContent = response.data;
    const base64Avatar = Buffer.from(svgContent).toString("base64");

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: "error", error: "User not found" });
    }

    user.isAvatarImageSet = true;
    user.avatarImage = `data:image/svg+xml;base64,${base64Avatar}`;

    await user.save();
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Error setting avatar:", error);
    res.status(500).json({ status: "error", error: "An error occurred" });
  }
});

// Get user details
router.get("/user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
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
        username: user.username,
        email: user.email,
        avatarImage: user.avatarImage,
      },
    });
  } catch (error) {
    res.status(401).json({ status: "error", error: "Invalid token" });
  }
});

// Fetch avatars
router.get("/avatars", async (req, res) => {
  const apiKey = process.env.MULTI_AVATAR_API;
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
    console.error("Error fetching avatars:", error);
    res.status(500).json({ error: "Error fetching avatars" });
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

    let base64Avatar = "";
    if (avatarImage) {
      try {
        const response = await axios.get(avatarImage, {
          responseType: "arraybuffer",
        });
        const buffer = Buffer.from(response.data);

        const optimizedBuffer = await sharp(buffer)
          .resize({ width: 200, height: 200 })
          .jpeg({ quality: 80 })
          .toBuffer();

        let currentSize = optimizedBuffer.length;
        let quality = 80;

        while (currentSize > 10240 && quality > 10) {
          quality -= 10;
          const reOptimizedBuffer = await sharp(buffer)
            .resize({ width: 200, height: 200 })
            .jpeg({ quality })
            .toBuffer();
          currentSize = reOptimizedBuffer.length;
          base64Avatar = `data:image/jpeg;base64,${reOptimizedBuffer.toString(
            "base64"
          )}`;
        }

        if (currentSize <= 10240) {
          base64Avatar = `data:image/jpeg;base64,${optimizedBuffer.toString(
            "base64"
          )}`;
        } else {
          return res.status(400).json({
            status: "error",
            error: "Avatar image is too large even after compression",
          });
        }
      } catch (imageError) {
        console.error("Error converting avatar image:", imageError);
        return res.status(500).json({
          status: "error",
          error: "Error processing avatar image",
        });
      }
    }

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isAvatarImageSet: !!avatarImage,
      avatarImage: base64Avatar,
    });

    await newUser.save();

    res.json({ status: "ok", userId: newUser._id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
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

// Middleware to verify the token
const verifyToken = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store the decoded user information in the request object
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ status: "error", message: "Unauthorized: Invalid token" });
  }
};

router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await User.find({ email: { $ne: req.user.email } }); // Exclude current user
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const redisClient = require("../utils/redisClient");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/userModel");
const { RateLimiterRedis } = require("rate-limiter-flexible");

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Setup rate limiter with Redis
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "send-otp",
  points: 3, // Number of allowed OTP requests
  duration: 60 * 10, // Per 10 minutes per email
  blockDuration: 60 * 10, // Block for 10 minutes if more than 3 requests are made
});

// Endpoint to send OTP to email
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  // Apply rate limiting
  await rateLimiter.consume(email);

  // Generate a secure OTP
  const otp = crypto.randomBytes(3).toString("hex").toUpperCase();

  try {
    // Store OTP in Redis with a 10-minute expiration time
    await redisClient.set(email, otp, {
      EX: 600, // Set expiration time to 600 seconds (10 minutes)
    });

    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    });

    res.json({ status: "ok", message: "OTP sent to email" });
  } catch (error) {
    if (error instanceof RateLimiterRedis) {
      res.status(429).json({
        status: "error",
        message: "Too many requests, please try again later.",
      });
    } else {
      console.error("Error sending OTP:", error);
      res.status(500).json({ status: "error", message: "Failed to send OTP" });
    }
  }
});

// Endpoint to verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp, username, password } = req.body;

  try {
    // Retrieve OTP from Redis
    const storedOtp = await redisClient.get(email);

    if (storedOtp && storedOtp === otp) {
      // OTP is correct, proceed with registration

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        isAvatarImageSet: false,
        avatarImage: "",
      });

      await newUser.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser._id, email },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h", // Token expires in 1 hour
        }
      );

      res.json({
        status: "ok",
        message: "OTP verified and user registered",
        token, // Send the token to the client
        userId: newUser._id, // Include userId in the response
      });
    } else {
      res.status(400).json({ status: "error", message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ status: "error", message: "Failed to verify OTP" });
  }
});

module.exports = router;

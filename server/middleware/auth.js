const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Middleware to check open routes (no authentication required)
const openRoutes = ["/otp/send-otp", "/otp/verify-otp"];
const skipAuthForOpenRoutes = (req, res, next) => {
  if (openRoutes.includes(req.path)) {
    return next(); // Skip authentication
  }
  next();
};

// Verify Token Middleware
const verifyToken = async (req, res, next) => {
  //console.log("verifyToken middleware triggered");
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ status: "error", message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user details and check if user exists
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    req.user = user; // Attach the full user object to the request
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(403).json({ status: "error", message: "Invalid token" });
  }
};

// Verify Admin Middleware
const verifyAdmin = async (req, res, next) => {
  //console.log("verifyAdmin middleware triggered");
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ status: "error", message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user details
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    // Check if the user has admin privileges
    if (!user.isAdmin) {
      return res
        .status(403)
        .json({ status: "error", message: "Admin access required" });
    }

    req.user = user; // Attach the full user object to the request
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    res
      .status(403)
      .json({ status: "error", message: "Invalid token or access denied" });
  }
};

module.exports = { verifyToken, verifyAdmin, skipAuthForOpenRoutes };

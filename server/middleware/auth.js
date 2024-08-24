const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const verifyToken = async (req, res, next) => {
  const openRoutes = ["/otp/send-otp", "/otp/verify-otp"];

  // Check if the current route is in the openRoutes list
  if (openRoutes.includes(req.path)) {
    return next(); // Skip authentication for these routes
  }
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ status: "error", message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Fetch the full user details
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(400).json({ status: "error", message: "Invalid token" });
  }
};

// Middleware to check if the user is an admin
const verifyAdmin = async (req, res, next) => {
  const openRoutes = ["/otp/send-otp", "/otp/verify-otp"];

  // Check if the current route is in the openRoutes list
  if (openRoutes.includes(req.path)) {
    return next(); // Skip authentication for these routes
  }

  try {
    // Decode and verify the JWT token
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Access denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the full user details
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    // Check if the user is an admin
    if (user.isAdmin) {
      req.user = user; // Attach user info to the request object
      next(); // User is an admin, proceed to the next middleware/controller
    } else {
      res
        .status(403)
        .json({ status: "error", message: "Admin access required" });
    }
  } catch (error) {
    console.error("Admin verification error:", error);
    res
      .status(400)
      .json({ status: "error", message: "Invalid token or access denied" });
  }
};

module.exports = { verifyToken, verifyAdmin };

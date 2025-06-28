const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Middleware to check open routes (no authentication required)
const openRoutes = ["/otp/send-otp", "/otp/verify-otp"];
const skipAuthForOpenRoutes = (req, res, next) => {
  if (openRoutes.some((route) => req.path.startsWith(route))) {
    return next(); // Skip authentication
  }
  next();
};

// Verify Token Middleware
const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "Access denied: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user details and check if user exists
    const user = await User.findById(decoded._id); // Use `_id` from token
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    req.user = { _id: user._id, email: user.email, isAdmin: user.isAdmin }; // Attach minimal user info
    console.log("Authenticated user:", req.user);
    next();
  } catch (error) {
    console.error("Token verification error:", error);

    const message =
      error.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    res.status(403).json({ status: "error", message });
  }
};

// Verify Admin Middleware
const verifyAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res
      .status(403)
      .json({ status: "error", message: "Admin access required by you!" });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin, skipAuthForOpenRoutes };

require("dotenv").config();
const express = require("express");
const { connectToMongoDB } = require("./config/database");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const redisClient = require("./utils/redisClient"); // Import Redis client

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const otpRoutes = require("./routes/otpRoutes");

app.use("/api", userRoutes);
app.use("/api", productRoutes);
app.use("/api", adminRoutes);
app.use("/api/otp", otpRoutes);

// Serve static files from the React app (optional)
app.use(express.static(path.join(__dirname, "public", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dist", "index.html"));
});

// Example of using the Redis client
app.get("/cache", async (req, res) => {
  try {
    const value = await redisClient.get("some_key"); // Use Redis client to get value
    res.json({ value });
  } catch (error) {
    console.error("Error fetching from Redis", error);
    res.status(500).send("Server Error");
  }
});

async function startServer() {
  try {
    await connectToMongoDB();
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit the process with failure code
  }
}

startServer();

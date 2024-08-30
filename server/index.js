require("dotenv").config();
const express = require("express");
const { connectToMongoDB } = require("./config/database");
const cors = require("cors");
const bodyParser = require("body-parser");
const redisClient = require("./utils/redisClient"); // Import Redis client

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "https://campusxchange-client.onrender.com",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow the necessary HTTP methods
    credentials: true,
  })
);
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

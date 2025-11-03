require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { connectToMongoDB } = require("./config/database");
const cors = require("cors");
const bodyParser = require("body-parser");
const redisClient = require("./utils/redisClient");
const Chat = require("./models/chat");
const Message = require("./models/message");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "https://campusxchange-client.onrender.com",
      "http://localhost:5173",
      /^https:\/\/.*\.run\.app$/, // ✅ Allow Cloud Run domains
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
const PORT = process.env.PORT || 8080;

// Middleware
app.use(
  cors({
    origin: [
      "https://campusxchange-client.onrender.com",
      "http://localhost:5173",
      /^https:\/\/.*\.run\.app$/, // ✅ Allow Cloud Run domains
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const RATE_LIMIT = 5;
const RATE_LIMIT_EXPIRY = 60;

// Routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const otpRoutes = require("./routes/otpRoutes");
const chatRoutes = require("./routes/chat");

app.use("/api", userRoutes);
app.use("/api", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/chat", chatRoutes);

// ✅ Health check endpoint - responds even if DB is down
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Redis Error Handling
redisClient.on("error", (err) => {
  console.error("Redis client error:", err);
});

redisClient.on("connect", () => {
  console.log("✅ Connected to Redis");
});

// Rate limiting function
const checkRateLimit = async (userId) => {
  try {
    const key = `rateLimit:${userId}`;
    const currentCount = await redisClient.get(key);

    if (currentCount && currentCount >= RATE_LIMIT) return false;

    const pipeline = redisClient.multi();
    pipeline.incr(key);
    pipeline.expire(key, RATE_LIMIT_EXPIRY);
    await pipeline.exec();

    return true;
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return true; // ✅ Allow message if Redis fails
  }
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  socket.on("joinChat", ({ chatId, userId }) => {
    if (!userId) {
      console.error("User ID is undefined");
      return;
    }
    socket.join(chatId);
  });

  socket.on("sendMessage", async ({ chatId, senderId, text }) => {
    try {
      const canSendMessage = await checkRateLimit(senderId);
      console.log("Message text:", text);

      if (!canSendMessage) {
        io.to(socket.id).emit(
          "rateLimitExceeded",
          "Message rate limit exceeded"
        );
        return;
      }

      const message = new Message({ chatId, sender: senderId, text });
      await message.save();

      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: message._id,
        updatedAt: Date.now(),
      });

      io.to(chatId).emit("receiveMessage", {
        _id: message._id,
        chatId,
        sender: senderId,
        text,
        createdAt: message.createdAt,
      });

      const cacheKey = `chat:${chatId}:recentMessages`;
      await redisClient.rPush(cacheKey, JSON.stringify(message)); // ✅ Changed to rPush
      await redisClient.lTrim(cacheKey, -50, -1);
      await redisClient.expire(cacheKey, 3600);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    // Silent disconnect
  });
});

app.get("/cache", async (req, res) => {
  try {
    const value = await redisClient.get("some_key");
    res.json({ value });
  } catch (error) {
    console.error("Error fetching from Redis", error);
    res.status(500).send("Server Error");
  }
});

// ✅ CRITICAL FIX: Start server FIRST, then connect to databases
async function startServer() {
  console.log("🚀 Starting CampusXchange backend...");
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Port: ${PORT}`);

  // ✅ START SERVER IMMEDIATELY
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server is listening on port ${PORT}`);
    console.log(`🏥 Health check available at http://0.0.0.0:${PORT}/health`);
  });

  // ✅ THEN connect to databases (non-blocking)
  try {
    console.log("Connecting to MongoDB...");
    await connectToMongoDB();
    console.log("✅ MongoDB connected.");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.warn("⚠️ Server will continue running without MongoDB");
  }

  // ✅ Redis connection (non-blocking)
  try {
    await redisClient.ping();
    console.log("✅ Redis connected.");
  } catch (err) {
    console.warn("⚠️ Redis connection failed:", err.message);
    console.warn("⚠️ Server will continue running without Redis");
  }
}

// ✅ Graceful shutdown
process.on("SIGTERM", () => {
  console.log("📴 SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

startServer();
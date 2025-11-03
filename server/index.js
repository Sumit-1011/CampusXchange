require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { connectToMongoDB } = require("./config/database");
const cors = require("cors");
const bodyParser = require("body-parser");
const redisClient = require("./utils/redisClient"); // Import Redis client
const Chat = require("./models/chat");
const Message = require("./models/message");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "https://campusxchange-client.onrender.com",
      "http://localhost:5173",
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
    ],
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow the necessary HTTP methods
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const RATE_LIMIT = 5; // messages per minute
const RATE_LIMIT_EXPIRY = 60; // in seconds

// Routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const otpRoutes = require("./routes/otpRoutes");
const chatRoutes = require("./routes/chat");

app.use("/api", userRoutes); //handler
app.use("/api", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Redis Error Handling
redisClient.on("error", (err) => {
  console.error("Redis client error:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

// Rate limiting function
const checkRateLimit = async (userId) => {
  const key = `rateLimit:${userId}`;
  const currentCount = await redisClient.get(key);

  if (currentCount && currentCount >= RATE_LIMIT) return false;

  // Increment count and set expiry if it's the first time
  const pipeline = redisClient.multi();
  pipeline.incr(key);
  pipeline.expire(key, RATE_LIMIT_EXPIRY);
  await pipeline.exec();

  return true;
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  //console.log("Connected user ID (type):", userId, typeof userId);

  // Join a specific chat room between buyer and seller
  socket.on("joinChat", ({ chatId, userId }) => {
    if (!userId) {
      console.error("User ID is undefined");
      return;
    }
    socket.join(chatId);
    //console.log(`User ${userId} joined chat ${chatId}`);
  });

  // Handle sending a message
  socket.on("sendMessage", async ({ chatId, senderId, text }) => {
    try {
      const canSendMessage = await checkRateLimit(senderId);
      console.log(text);

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
      await redisClient.lPush(cacheKey, JSON.stringify(message)); // Correct method for modern redis
      await redisClient.lTrim(cacheKey, -50, -1); // Correct method for modern redis
      await redisClient.expire(cacheKey, 3600);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    //console.log("Client disconnected:", socket.id);
  });
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
    console.log("Connecting to MongoDB...");
    await connectToMongoDB();
    console.log("✅ MongoDB connected successfully.");

    // Optional: ping Redis to confirm
    await redisClient.ping();
    console.log("✅ Redis connected successfully.");

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed during startup:", error);
    process.exit(1);
  }
}

startServer();


startServer();

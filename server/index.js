require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Import routes
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
app.use("/api", userRoutes);
app.use("/api/messages", messageRoutes);

// Serve static files from the React app (production setup)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "public/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public/dist/index.html"));
  });
} else {
  // Proxy setup for development
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5173",
      changeOrigin: true,
      pathRewrite: { "^/api": "" },
    })
  );

  app.use(
    createProxyMiddleware({
      target: "http://localhost:5173",
      changeOrigin: true,
    })
  );
}

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const server = http.createServer(app);
    const io = socketIo(server, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("New client connected");

      socket.on("sendMessage", async (message) => {
        try {
          const sender = await User.findOne({ _id: message.senderId });
          const receiver = await User.findOne({ _id: message.receiverId });

          if (!sender || !receiver) {
            console.error("Sender or receiver not found");
            return;
          }

          const newMessage = new Message({
            chatId: message.chatId,
            senderId: sender._id,
            receiverId: receiver._id,
            content: message.content,
          });
          await newMessage.save();

          io.emit("receiveMessage", newMessage);
        } catch (error) {
          console.error("Error sending message:", error);
        }
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });

    server.listen(port, () => {
      console.log(`Server is listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit the process with failure code
  }
}

startServer();

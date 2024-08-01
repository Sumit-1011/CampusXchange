require("dotenv").config();
const express = require("express");
const { connectToMongoDB } = require("./config/database");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000", // Adjust this according to your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");

app.use("/api", userRoutes);
app.use("/api", productRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "public/dist")));

// Handle all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/dist", "index.html"));
});

async function startServer() {
  try {
    await connectToMongoDB();
    app.listen(PORT, () => {
      console.log(`Server is listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit the process with failure code
  }
}

startServer();

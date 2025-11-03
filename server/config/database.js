const mongoose = require("mongoose");

const connectToMongoDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI is missing in environment variables!");
    throw new Error("MONGO_URI not defined");
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    // ❌ remove process.exit(1)
    // Cloud Run interprets exit(1) as a fatal startup failure
  }
};

module.exports = { connectToMongoDB };

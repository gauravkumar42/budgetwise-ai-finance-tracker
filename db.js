// db.js
// MongoDB connection using Mongoose

require("dotenv").config();

const mongoose = require("mongoose");
const dns = require("dns");

// Force Node.js DNS resolution to use Google DNS.
// This fixes MongoDB Atlas SRV lookup issues on some networks.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB Atlas...");

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB error:", err.message);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
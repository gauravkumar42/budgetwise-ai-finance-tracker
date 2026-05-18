// backend/config/db.js
// ─────────────────────────────────────────────
// MongoDB connection using Mongoose.
// Called once at server startup; exits process on failure.
// ─────────────────────────────────────────────

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options suppress deprecation warnings in Mongoose 8+
      // (they're the defaults, but being explicit is good practice)
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);

    // Log when connection is lost so you know to investigate
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌  MongoDB error:", err.message);
    });
  } catch (error) {
    console.error(`❌  MongoDB connection failed: ${error.message}`);
    process.exit(1); // Crash fast — don't run the API without a DB
  }
};

module.exports = connectDB;

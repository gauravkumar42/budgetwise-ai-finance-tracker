// server.js
// Express application entry point.
// Loads environment variables → connects DB → mounts routes → starts server.

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();


// Connect to MongoDB

connectDB();

// Allowed Origins

const allowedOrigins = [
  "http://localhost:5173",
  "https://budgetwise-ai-finance-tracker.vercel.app",
];


// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // (Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Allow known origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments
      if (/\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked for origin:", origin);

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },

    credentials: true,
  })
);


// Body Parsers

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));

// Health Check

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});


// Routes

app.use("/api/auth", require("./auth"));
app.use("/api/transactions", require("./transactions"));
app.use("/api/ai", require("./ai"));


// 404 Handler

app.use((_req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});


// Global Error Handler

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",

    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
});


// Start Server

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} [${
      process.env.NODE_ENV || "development"
    }]`
  );
});
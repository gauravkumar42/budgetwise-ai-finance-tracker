// server.js
// ─────────────────────────────────────────────
// Express application entry point.
// Loads env vars → connects DB → mounts routes → starts listener.
// ─────────────────────────────────────────────

require("dotenv").config(); // Must be first — loads .env before anything else

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

// ── Bootstrap ────────────────────────────────
connectDB();

const app = express();

// ── Allowed Origins ──────────────────────────
const allowedOrigins = [
  "http://localhost:5173", // Local development
  "https://budgetwise-ai-finance-tracker.vercel.app", // Production frontend
];

// ── Allowed Origins ──────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "https://budgetwise-ai-finance-tracker.vercel.app",
];

// ── Global Middleware ────────────────────────
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Allow explicitly listed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel preview deployments
      // Example:
      // https://budgetwise-ai-finance-tracker-abc123-gauravkumar43.vercel.app
      if (/\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // Block all other origins
      console.log("❌ CORS blocked for origin:", origin);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));

// ── Health Check ─────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Route Mounts ─────────────────────────────
app.use("/api/auth", require("./auth"));
app.use("/api/transactions", require("./transactions"));
app.use("/api/ai", require("./ai"));

// ── 404 Handler ──────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Global Error Handler ─────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ── Start Server ─────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`
  );
});
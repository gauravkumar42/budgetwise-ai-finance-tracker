// backend/server.js
// ─────────────────────────────────────────────
// Express application entry point.
// Loads env vars → connects DB → mounts routes → starts listener.
// ─────────────────────────────────────────────

require("dotenv").config(); // Must be first — loads .env before anything else
const express = require("express");
const cors = require("cors");
const connectDB = require('./db');

// ── Bootstrap ────────────────────────────────
connectDB();

const app = express();

// ── Global Middleware ─────────────────────────
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? "https://your-production-domain.com"  // swap in prod
      : "http://localhost:5173",              // Vite dev server
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));      // Parse JSON bodies (cap size)
app.use(express.urlencoded({ extended: false }));

// ── Health Check ──────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Route Mounts ──────────────────────────────
app.use("/api/auth", require("./auth"));
app.use("/api/transactions", require("./transactions"));
app.use("/api/ai", require("./ai"));

// ── 404 Handler ───────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Global Error Handler ──────────────────────
// Express recognises 4-arg middleware as error handlers
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ── Start Server ──────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
});

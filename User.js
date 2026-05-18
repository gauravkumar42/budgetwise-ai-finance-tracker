// backend/models/User.js
// ─────────────────────────────────────────────
// User schema with password hashing via bcryptjs.
// Passwords are NEVER stored in plain text.
// ─────────────────────────────────────────────

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never returned in queries by default
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt automatically
  }
);

// ── Pre-save Hook: Hash password before storing ──
UserSchema.pre("save", async function (next) {
  // Only hash when the password field is new or modified
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12); // 12 rounds is a solid balance
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance Method: Compare plain password to hash ──
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);

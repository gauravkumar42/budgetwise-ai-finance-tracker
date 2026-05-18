// backend/models/Transaction.js
// ─────────────────────────────────────────────
// Stores each income / expense entry linked to a User.
// Category list is intentionally kept short for clean chart legends.
// ─────────────────────────────────────────────

const mongoose = require("mongoose");

const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Housing & Rent",
  "Transport",
  "Healthcare",
  "Entertainment",
  "Shopping",
  "Education",
  "Utilities",
  "Travel",
  "Other",
];

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other",
];

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Fast lookups by user
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "Transaction type is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than zero"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ── Virtual: formatted date (ISO string) ──────
TransactionSchema.virtual("dateFormatted").get(function () {
  return this.date.toISOString().split("T")[0];
});

// Expose virtuals when converting to JSON / Object
TransactionSchema.set("toJSON", { virtuals: true });

// ── Statics: category lists (used in validation) ──
TransactionSchema.statics.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
TransactionSchema.statics.INCOME_CATEGORIES  = INCOME_CATEGORIES;

module.exports = mongoose.model("Transaction", TransactionSchema);

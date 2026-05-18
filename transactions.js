// backend/routes/transactions.js
// ─────────────────────────────────────────────
// All routes are protected (require valid JWT).
//
// GET    /api/transactions          — list user's transactions (with filters)
// POST   /api/transactions          — create a transaction
// DELETE /api/transactions/:id      — delete a transaction
// GET    /api/transactions/summary  — totals + category breakdown
// ─────────────────────────────────────────────

const express     = require("express");
const { body, validationResult } = require("express-validator");
const Transaction = require("./Transaction");
const { protect } = require('./authMiddleware');

const router = express.Router();
router.use(protect); // Every route below requires a valid JWT

// ── GET /api/transactions ─────────────────────
router.get("/", async (req, res) => {
  try {
    const { type, category, startDate, endDate, limit = 50 } = req.query;

    const filter = { user: req.user._id };
    if (type)      filter.type     = type;
    if (category)  filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(Number(limit));

    res.json(transactions);
  } catch (err) {
    console.error("Get transactions error:", err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// ── GET /api/transactions/summary ────────────
// Returns totals and a per-category breakdown for charts.
router.get("/summary", async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate income and expense totals
    const totals = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const summary = { income: 0, expenses: 0 };
    totals.forEach(({ _id, total }) => {
      if (_id === "income")  summary.income   = total;
      if (_id === "expense") summary.expenses = total;
    });
    summary.balance = summary.income - summary.expenses;

    // Per-category breakdown (expenses only, for chart)
    const categoryBreakdown = await Transaction.aggregate([
      { $match: { user: userId, type: "expense" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({ summary, categoryBreakdown });
  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ message: "Failed to generate summary" });
  }
});

// ── POST /api/transactions ────────────────────
router.post(
  "/",
  [
    body("type").isIn(["income", "expense"]).withMessage("Type must be income or expense"),
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
    body("description").optional().trim().isLength({ max: 200 }),
    body("date").optional().isISO8601().withMessage("Date must be a valid ISO date"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { type, category, amount, description, date } = req.body;

      const transaction = await Transaction.create({
        user: req.user._id,
        type,
        category,
        amount,
        description,
        date: date ? new Date(date) : undefined,
      });

      res.status(201).json(transaction);
    } catch (err) {
      console.error("Create transaction error:", err);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  }
);

// ── DELETE /api/transactions/:id ──────────────
router.delete("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id, // Ownership check — users can only delete their own
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await transaction.deleteOne();
    res.json({ message: "Transaction deleted", id: req.params.id });
  } catch (err) {
    console.error("Delete transaction error:", err);
    res.status(500).json({ message: "Failed to delete transaction" });
  }
});

module.exports = router;

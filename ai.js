// ai.js
// Route: /api/ai/suggestions
// Uses Google Gemini API (free tier) with automatic offline fallback.

const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Transaction = require("./Transaction");
const { protect } = require("./authMiddleware");

const router = express.Router();
router.use(protect);

// Initialize Gemini only if API key is available
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// --------------------
// Offline fallback
// --------------------
function generateOfflineSuggestions(transactions) {
  const incomeTransactions = transactions.filter((t) => t.type === "income");
  const expenseTransactions = transactions.filter((t) => t.type === "expense");

  const totalIncome = incomeTransactions.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0
  );

  const totalExpenses = expenseTransactions.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0
  );

  const netBalance = totalIncome - totalExpenses;

  const categoryTotals = {};
  for (const transaction of expenseTransactions) {
    const category = transaction.category || "Other";
    categoryTotals[category] =
      (categoryTotals[category] || 0) + Number(transaction.amount || 0);
  }

  const sortedCategories = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  );

  const topCategory = sortedCategories[0];
  const savingsRate =
    totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

  let suggestions = "🤖 AI Budget Analysis\n\n";
  suggestions += "📊 Financial Summary\n";
  suggestions += `• Total Income: ₹${totalIncome.toFixed(2)}\n`;
  suggestions += `• Total Expenses: ₹${totalExpenses.toFixed(2)}\n`;
  suggestions += `• Net Balance: ₹${netBalance.toFixed(2)}\n`;
  suggestions += `• Savings Rate: ${savingsRate.toFixed(1)}%\n\n`;

  if (topCategory) {
    suggestions += `💸 Highest Spending Category: ${topCategory[0]} (₹${topCategory[1].toFixed(2)})\n\n`;
  }

  suggestions += "💡 Recommendations\n";
  if (savingsRate >= 20) {
    suggestions += "• Excellent savings rate. Keep maintaining your current habits.\n";
  } else if (savingsRate > 0) {
    suggestions += "• Aim to save at least 20% of your monthly income.\n";
  } else {
    suggestions += "• Reduce expenses to bring your budget back into positive territory.\n";
  }

  if (topCategory) {
    suggestions += `• Review your ${topCategory[0]} spending for possible reductions.\n`;
  }

  suggestions += "• Build an emergency fund covering 3–6 months of expenses.\n";
  suggestions += "• Review recurring subscriptions and fixed costs.\n";
  suggestions += "• Reassess your budget at the end of each month.\n";

  return suggestions;
}

// --------------------
// GET /api/ai/suggestions
// --------------------
router.get("/suggestions", async (req, res) => {
  try {
    const userId = req.user._id;

    // Last 90 days of transactions
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: since },
    }).sort({ date: -1 });

    if (transactions.length === 0) {
      return res.json({
        suggestions:
          "🤖 No transactions found yet.\n\nAdd some income and expense records to receive personalized budgeting suggestions.",
      });
    }

    // Build structured summary for Gemini
    const incomeTransactions = transactions.filter((t) => t.type === "income");
    const expenseTransactions = transactions.filter((t) => t.type === "expense");

    const totalIncome = incomeTransactions.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );

    const totalExpenses = expenseTransactions.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );

    const categoryTotals = {};
    for (const transaction of expenseTransactions) {
      const category = transaction.category || "Other";
      categoryTotals[category] =
        (categoryTotals[category] || 0) + Number(transaction.amount || 0);
    }

    const categoryLines =
      Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .map(
          ([category, amount]) =>
            `- ${category}: ₹${amount.toFixed(2)}`
        )
        .join("\n") || "- No expense categories available.";

    // Use Gemini if available; otherwise fallback
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
        });

        const prompt = `
You are a practical and encouraging personal finance advisor.

Analyze the following financial data from the last 90 days and provide 4 to 6 concise, actionable budgeting suggestions.

Total Income: ₹${totalIncome.toFixed(2)}
Total Expenses: ₹${totalExpenses.toFixed(2)}
Net Balance: ₹${(totalIncome - totalExpenses).toFixed(2)}

Expense Breakdown by Category:
${categoryLines}

Requirements:
- Use bullet points.
- Highlight the highest spending areas.
- Suggest realistic savings targets.
- Maintain a positive tone.
`;

        const result = await model.generateContent(prompt);
        const suggestions = result.response.text().trim();

        if (suggestions) {
          return res.json({ suggestions });
        }
      } catch (geminiError) {
        console.error(
          "Gemini API failed. Falling back to offline analysis:",
          geminiError.message
        );
      }
    }

    // Offline fallback
    const suggestions = generateOfflineSuggestions(transactions);
    res.json({ suggestions });
  } catch (err) {
    console.error("AI suggestions error:", err);
    res.status(500).json({
      message: "Failed to generate AI suggestions.",
    });
  }
});

module.exports = router;
const db = require("../config/db");
const { sendAlertIfEnabled } = require("../utils/email");

/**
 * ADD TRANSACTION API
 * POST /api/transactions
 */
exports.addTransaction = async (req, res) => {
  try {
    const { user_id, type, category, amount, date } = req.body;

    if (!user_id || !type || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const sql = `
      INSERT INTO transactions (user_id, type, category, amount, date)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      user_id,
      type.toLowerCase(),
      category,
      amount,
      date,
    ]);

    res.status(201).json({
      message: "Transaction added successfully",
      transactionId: result.insertId,
    });

    // 🔔 Logic for Alerts (Run in background)
    if (type.toLowerCase() === 'expense') {
      const budgetMonth = date.substring(0, 7); // YYYY-MM
      const [budgets] = await db.query(
        "SELECT amount FROM budgets WHERE user_id = ? AND category = ? AND month = ?",
        [user_id, category, budgetMonth]
      );

      if (budgets.length > 0) {
        const budgetLimit = budgets[0].amount;
        const [spentHistory] = await db.query(
          "SELECT SUM(amount) as totalSpent FROM transactions WHERE user_id = ? AND category = ? AND type = 'expense' AND DATE_FORMAT(date, '%Y-%m') = ?",
          [user_id, category, budgetMonth]
        );

        const totalSpent = spentHistory[0].totalSpent || 0;

        if (totalSpent > budgetLimit) {
          await sendAlertIfEnabled(user_id, 'budgetReminders', {
            subject: `⚠️ Budget Exceeded: ${category}`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #fee2e2; border-radius: 10px;">
                <h2 style="color: #dc2626;">Budget Alert!</h2>
                <p>Hello,</p>
                <p>You've exceeded your <strong>${category}</strong> budget for <strong>${budgetMonth}</strong>.</p>
                <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 5px 0;">Limit: <strong>₹${budgetLimit}</strong></p>
                  <p style="margin: 5px 0;">Current Spending: <strong style="color: #dc2626;">₹${totalSpent}</strong></p>
                </div>
                <p>Time to adjust your spending or update your budget!</p>
              </div>
            `
          });
        }
      }
    }

  } catch (err) {
    console.error("Insert Transaction Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/**
 * GET TRANSACTIONS API
 * GET /api/transactions/:userId
 */
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.params.userId;

    const sql = `
      SELECT * FROM transactions
      WHERE user_id = ?
      ORDER BY date DESC
    `;

    const [rows] = await db.query(sql, [userId]);

    res.json(rows);

  } catch (err) {
    console.error("Fetch Transaction Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/**
 * DELETE TRANSACTION API
 * DELETE /api/transactions/:id
 */
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "DELETE FROM transactions WHERE id = ?";
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("Delete Transaction Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/**
 * UPDATE TRANSACTION API
 * PUT /api/transactions/:id
 */
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, category, amount, date } = req.body;

    if (!type || !amount || !date) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const sql = `
      UPDATE transactions 
      SET type = ?, category = ?, amount = ?, date = ?
      WHERE id = ?
    `;

    const [result] = await db.query(sql, [type.toLowerCase(), category, amount, date, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction updated successfully" });
  } catch (err) {
    console.error("Update Transaction Error:", err);
    res.status(500).json({
      message: "Database error",
      error: err.message
    });
  }
};

/**
 * GET TRANSACTION SUMMARY API (FOR REPORTS)
 * GET /api/transactions/summary/:userId
 */
exports.getTransactionSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Monthly Totals (Last 6 Months)
    const monthlySql = `
      SELECT 
        DATE_FORMAT(date, '%b') as name,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(date, '%Y-%m'), name
      ORDER BY MIN(date) ASC
    `;

    // 2. Category Breakdown (Expenses only)
    const categorySql = `
      SELECT category as name, SUM(amount) as value
      FROM transactions
      WHERE user_id = ? AND type = 'expense'
      GROUP BY category
    `;

    // 3. Financial Totals
    const totalsSql = `
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpense
      FROM transactions
      WHERE user_id = ?
    `;

    const [monthlyData] = await db.query(monthlySql, [userId]);
    const [categoryData] = await db.query(categorySql, [userId]);
    const [totals] = await db.query(totalsSql, [userId]);

    res.json({
      monthly: monthlyData,
      categories: categoryData,
      summary: totals[0] || { totalIncome: 0, totalExpense: 0 }
    });

  } catch (err) {
    console.error("Summary Fetch Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

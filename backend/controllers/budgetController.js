const db = require("../config/db");
const { sendAlertIfEnabled } = require("../utils/email");

/**
 * ADD BUDGET API
 * POST /api/budgets
 */
exports.addBudget = async (req, res) => {
    try {
        const { user_id, category, amount, month, description } = req.body;

        if (!user_id || !category || !amount || !month) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const sql = `
      INSERT INTO budgets (user_id, category, amount, month, description)
      VALUES (?, ?, ?, ?, ?)
    `;

        const [result] = await db.query(sql, [
            user_id,
            category,
            amount,
            month,
            description || null,
        ]);

        res.status(201).json({
            message: "Budget created successfully",
            budgetId: result.insertId,
        });

        // 🔔 Send notification if enabled
        await sendAlertIfEnabled(user_id, 'budgetReminders', {
            subject: `💰 New Budget Created: ${category}`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                <h2 style="color: #10b981;">Budget Established</h2>
                <p>Hello,</p>
                <p>You have set a new budget for <strong>${category}</strong> for the month of <strong>${month}</strong>.</p>
                <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                  <p style="margin: 5px 0;">Limit: <strong>₹${parseFloat(amount).toLocaleString()}</strong></p>
                  <p style="margin: 5px 0;">Notes: ${description || 'No notes'}</p>
                </div>
                <p>We'll notify you if your spending approaches this limit.</p>
              </div>
            `
        });

    } catch (err) {
        console.error("Insert Budget Error:", err);
        res.status(500).json({ message: "Database error" });
    }
};

/**
 * GET BUDGETS API
 * GET /api/budgets/:userId
 */
exports.getBudgets = async (req, res) => {
    try {
        const userId = req.params.userId;

        const sql = `
      SELECT b.*, 
             COALESCE(SUM(t.amount), 0) as spent
      FROM budgets b
      LEFT JOIN transactions t ON b.user_id = t.user_id 
                               AND b.category = t.category 
                               AND t.type = 'expense'
                               AND DATE_FORMAT(t.date, '%Y-%m') = b.month
      WHERE b.user_id = ?
      GROUP BY b.id
      ORDER BY b.month DESC, b.category ASC
    `;

        const [rows] = await db.query(sql, [userId]);

        res.json(rows);

    } catch (err) {
        console.error("Fetch Budgets Error:", err);
        res.status(500).json({ message: "Database error" });
    }
};

/**
 * DELETE BUDGET API
 * DELETE /api/budgets/:id
 */
exports.deleteBudget = async (req, res) => {
    try {
        const budgetId = req.params.id;

        const sql = "DELETE FROM budgets WHERE id = ?";
        await db.query(sql, [budgetId]);

        res.json({ message: "Budget deleted successfully" });

    } catch (err) {
        console.error("Delete Budget Error:", err);
        res.status(500).json({ message: "Database error" });
    }
};

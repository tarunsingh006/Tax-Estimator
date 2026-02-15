const db = require("../config/db");

/**
 * SAVE GENERATED REPORT
 * POST /api/reports
 */
exports.saveReport = async (req, res) => {
    try {
        const { user_id, report_type, period, format } = req.body;

        if (!user_id || !report_type || !period || !format) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const sql = `
            INSERT INTO reports (user_id, report_type, period, format)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [user_id, report_type, period, format]);

        res.status(201).json({
            message: "Report history saved successfully",
            reportId: result.insertId,
        });
    } catch (err) {
        console.error("Save Report Error:", err);
        res.status(500).json({ message: "Database error" });
    }
};

/**
 * GET REPORT HISTORY
 * GET /api/reports/:userId
 */
exports.getReportHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        const sql = `
            SELECT * FROM reports
            WHERE user_id = ?
            ORDER BY generated_at DESC
        `;

        const [rows] = await db.query(sql, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("Fetch Report History Error:", err);
        res.status(500).json({ message: "Database error" });
    }
};

/**
 * DELETE REPORT HISTORY ITEM
 * DELETE /api/reports/:id
 */
exports.deleteReportHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = "DELETE FROM reports WHERE id = ?";
        const [result] = await db.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Report history item not found" });
        }

        res.json({ message: "Report history item deleted successfully" });
    } catch (err) {
        console.error("Delete Report History Error:", err);
        res.status(500).json({ message: "Database error" });
    }
};

const db = require("../config/db");

/**
 * SAVE TAX ESTIMATE
 * POST /api/taxes/estimate
 */
exports.saveEstimate = async (req, res) => {
    try {
        const {
            user_id,
            country,
            state,
            filingStatus,
            quarter,
            grossIncome,
            businessExpenses,
            retirementContributions,
            healthInsurance,
            homeOffice,
            estimatedTax
        } = req.body;

        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const sql = `
            INSERT INTO tax_estimates 
            (user_id, country, state, filing_status, quarter, gross_income, business_expenses, retirement_contributions, health_insurance, home_office, estimated_tax)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            user_id,
            country,
            state,
            filingStatus,
            quarter,
            grossIncome || 0,
            businessExpenses || 0,
            retirementContributions || 0,
            healthInsurance || 0,
            homeOffice || 0,
            estimatedTax
        ]);

        res.status(201).json({
            message: "Tax estimate saved successfully",
            estimateId: result.insertId
        });

    } catch (err) {
        console.error("Save Tax Estimate Error:", err);
        res.status(500).json({ message: "Database error" });
    }
};

/**
 * GET TAX ESTIMATES FOR USER
 * GET /api/taxes/estimates/:userId
 */
exports.getEstimates = async (req, res) => {
    try {
        const userId = req.params.userId;
        const sql = "SELECT * FROM tax_estimates WHERE user_id = ? ORDER BY created_at DESC";
        const [rows] = await db.query(sql, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("Fetch Tax Estimates Error:", err);
        res.status(500).json({ message: "Database error" });
    }
};

/**
 * GET TAX CALENDAR EVENTS
 * GET /api/taxes/calendar/:userId?year=2025
 */
exports.getCalendarEvents = async (req, res) => {
    try {
        const userId = req.params.userId;
        const year = req.query.year || new Date().getFullYear();

        console.log(`📅 Fetching calendar for userId: ${userId}, Year: ${year}`);

        // Fetch only user specific events for this year
        const sql = `
            SELECT * FROM tax_calendar_events 
            WHERE user_id = ? 
            AND YEAR(event_date) = ?
            ORDER BY event_date ASC
        `;
        const [rows] = await db.query(sql, [userId, year]);

        console.log(`✅ Found ${rows.length} user events for ${year}`);
        res.json(rows);
    } catch (err) {
        console.error("❌ Fetch Tax Calendar Error:", err);
        res.status(500).json({ message: "Database error" });
    }
};

/**
 * SAVE CALENDAR EVENT
 * POST /api/taxes/calendar
 */
exports.saveCalendarEvent = async (req, res) => {
    try {
        const { user_id, title, event_date, description, event_type } = req.body;

        if (!user_id || !title || !event_date) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const sql = `
            INSERT INTO tax_calendar_events (user_id, title, event_date, description, event_type)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [user_id, title, event_date, description, event_type || 'reminder']);

        res.status(201).json({
            message: "Calendar event saved",
            eventId: result.insertId
        });
    } catch (err) {
        console.error("❌ Save Calendar Event Error:", err);
        res.status(500).json({ message: "Database error" });
    }
};

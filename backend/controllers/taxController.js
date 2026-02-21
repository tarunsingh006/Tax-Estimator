const db = require("../config/db");
const { sendAlertIfEnabled } = require("../utils/email");

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

        // 🔔 Send Email notification if enabled
        await sendAlertIfEnabled(user_id, 'emailAlerts', {
            subject: `📊 New Tax Estimate: ${quarter}`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                <h2 style="color: #3b82f6;">Tax Estimate Saved</h2>
                <p>Hello,</p>
                <p>Your tax estimation for <strong>${quarter}</strong> has been saved to your history.</p>
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 5px 0;">Country: <strong>${country}</strong></p>
                  <p style="margin: 5px 0;">Estimated Tax: <strong style="color: #3b82f6;">₹${parseFloat(estimatedTax).toLocaleString()}</strong></p>
                </div>
                <p>You can view the full breakdown in your Tax Estimator history.</p>
              </div>
            `
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

        // 🔔 Send Email notification if enabled
        await sendAlertIfEnabled(user_id, 'taxDeadlines', {
            subject: `📅 New Tax Deadline: ${title}`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                <h2 style="color: #ef4444;">Tax Deadline Reminder</h2>
                <p>Hello,</p>
                <p>A new event has been added to your tax calendar:</p>
                <div style="background: #fff5f5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                  <h3 style="margin: 0 0 10px 0;">${title}</h3>
                  <p style="margin: 5px 0;">Date: <strong>${new Date(event_date).toLocaleDateString()}</strong></p>
                  <p style="margin: 5px 0;">Description: ${description || 'No description provided'}</p>
                </div>
                <p>We'll keep you updated on your deadlines.</p>
              </div>
            `
        });
    } catch (err) {
        console.error("❌ Save Calendar Event Error:", err);
        res.status(500).json({ message: "Database error" });
    }
};

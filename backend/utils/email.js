const transporter = require("./mailer");
const db = require("../config/db");

/**
 * Sends an email alert to a user if their preferences allow it.
 * @param {number} userId - The ID of the user.
 * @param {string} preferenceKey - The key in notification_preferences (e.g., 'budgetReminders').
 * @param {Object} mailOptions - Nodemailer mail options (subject, html, etc.).
 */
async function sendAlertIfEnabled(userId, preferenceKey, mailOptions) {
    try {
        const [users] = await db.query(
            "SELECT email, notification_preferences FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) return;

        const user = users[0];
        const prefs = typeof user.notification_preferences === 'string'
            ? JSON.parse(user.notification_preferences)
            : user.notification_preferences;

        // Check if the specific alert is enabled
        // Note: Security/Account emails (like password reset) should not use this check
        // as they are critical. This is for optional alerts.
        if (prefs && prefs[preferenceKey] === true) {
            console.log(`Sending ${preferenceKey} alert to ${user.email}...`);

            await transporter.sendMail({
                from: `"TaxPal Alerts" <onboarding@resend.dev>`,
                to: user.email,
                ...mailOptions
            });

            console.log(`${preferenceKey} alert sent successfully.`);
        } else {
            console.log(`Skipping ${preferenceKey} alert for user ${userId} (disabled in settings).`);
        }
    } catch (err) {
        console.error(`Error sending ${preferenceKey} alert:`, err);
    }
}

module.exports = { sendAlertIfEnabled };

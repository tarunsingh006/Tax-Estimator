const db = require("../config/db");
const bcrypt = require("bcrypt");

// Get user profile and settings
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(
            "SELECT id, username, full_name, email, country, income_bracket, currency, language, notification_preferences FROM users WHERE id = ?",
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("Get profile error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, email, currency, language } = req.body;

        await db.query(
            "UPDATE users SET full_name = ?, email = ?, currency = ?, language = ? WHERE id = ?",
            [full_name, email, currency, language, userId]
        );

        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Update notification preferences
exports.updateNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notification_preferences } = req.body;

        await db.query(
            "UPDATE users SET notification_preferences = ? WHERE id = ?",
            [JSON.stringify(notification_preferences), userId]
        );

        res.json({ message: "Notification preferences updated successfully" });
    } catch (err) {
        console.error("Update notifications error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        const [users] = await db.query("SELECT password_hash FROM users WHERE id = ?", [userId]);
        const user = users[0];

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect current password" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [hashedPassword, userId]);

        res.json({ message: "Password changed successfully" });
    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete account
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        await db.query("DELETE FROM users WHERE id = ?", [userId]);
        res.json({ message: "Account deleted successfully" });
    } catch (err) {
        console.error("Delete account error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

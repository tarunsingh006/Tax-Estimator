const db = require("./config/db");

async function runSQL() {
    try {
        console.log("Starting migration...");

        // Add columns to users table (using IF NOT EXISTS logic via checking if they exist first)
        const [columns] = await db.query("SHOW COLUMNS FROM users");
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('currency')) {
            await db.query("ALTER TABLE users ADD COLUMN currency VARCHAR(10) DEFAULT 'USD'");
            console.log("Added currency column");
        }
        if (!columnNames.includes('language')) {
            await db.query("ALTER TABLE users ADD COLUMN language VARCHAR(20) DEFAULT 'English'");
            console.log("Added language column");
        }
        if (!columnNames.includes('notification_preferences')) {
            await db.query("ALTER TABLE users ADD COLUMN notification_preferences JSON DEFAULT (JSON_OBJECT('emailAlerts', true, 'budgetReminders', true, 'taxDeadlines', true, 'weeklyReports', false))");
            console.log("Added notification_preferences column");
        }

        // Create categories table
        await db.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                color VARCHAR(20) DEFAULT '#3b82f6',
                type ENUM('income', 'expense') DEFAULT 'expense',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("Categories table ready");

        // Seed default categories for users who don't have any
        const [users] = await db.query("SELECT id FROM users");
        for (const user of users) {
            const [existingCats] = await db.query("SELECT id FROM categories WHERE user_id = ?", [user.id]);
            if (existingCats.length === 0) {
                await db.query("INSERT INTO categories (user_id, name, color, type) VALUES (?, ?, ?, ?)", [user.id, 'Business Expenses', '#ef4444', 'expense']);
                await db.query("INSERT INTO categories (user_id, name, color, type) VALUES (?, ?, ?, ?)", [user.id, 'Office Rent', '#3b82f6', 'expense']);
                await db.query("INSERT INTO categories (user_id, name, color, type) VALUES (?, ?, ?, ?)", [user.id, 'Software Subscriptions', '#8b5cf6', 'expense']);
                await db.query("INSERT INTO categories (user_id, name, color, type) VALUES (?, ?, ?, ?)", [user.id, 'Professional Development', '#22c55e', 'expense']);
                console.log(`Seeded categories for user ${user.id}`);
            }
        }

        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration error:", err);
        process.exit(1);
    }
}
runSQL();

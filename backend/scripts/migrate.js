const db = require("../config/db");

async function migrate() {
    try {
        const tableSql = `
      CREATE TABLE IF NOT EXISTS budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        month VARCHAR(7) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
        await db.query(tableSql);
        console.log("✅ Budgets table ensured.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        process.exit(1);
    }
}

migrate();

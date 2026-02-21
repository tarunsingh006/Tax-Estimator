const db = require("./config/db");

async function fixTable() {
    try {
        console.log("Fixing password_resets table...");

        const [columns] = await db.query("SHOW COLUMNS FROM password_resets");
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('verified')) {
            await db.query("ALTER TABLE password_resets ADD COLUMN verified TINYINT(1) DEFAULT 0");
            console.log("Added verified column");
        }
        if (!columnNames.includes('reset_session_token')) {
            await db.query("ALTER TABLE password_resets ADD COLUMN reset_session_token VARCHAR(255)");
            console.log("Added reset_session_token column");
        }

        console.log("Table fix completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error fixing table:", err);
        process.exit(1);
    }
}
fixTable();

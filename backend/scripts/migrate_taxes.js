const db = require("../config/db");
const fs = require("fs");
const path = require("path");

async function migrateTaxes() {
    try {
        const sqlPath = path.join(__dirname, "../setup_taxes.sql");
        const sql = fs.readFileSync(sqlPath, "utf8");

        // Split by semicolon to execute multiple statements
        const statements = sql
            .split(";")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        for (const statement of statements) {
            await db.query(statement);
        }

        console.log("✅ Tax tables and seed data ensured.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Tax migration failed:", err.message);
        process.exit(1);
    }
}

migrateTaxes();

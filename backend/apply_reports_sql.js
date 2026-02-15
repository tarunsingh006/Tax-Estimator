const db = require("./config/db");
const fs = require("fs");
const path = require("path");

async function runSQL() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, "setup_reports.sql"), "utf8");
        await db.query(sql);
        console.log("Reports table created successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error creating reports table:", err);
        process.exit(1);
    }
}
runSQL();

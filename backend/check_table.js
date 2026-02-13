const db = require("./config/db");

async function check() {
    try {
        const [rows] = await db.query("DESCRIBE transactions");
        console.log("Transactions Table Structure:", rows);
        process.exit(0);
    } catch (err) {
        console.error("Error checking table:", err);
        process.exit(1);
    }
}
check();

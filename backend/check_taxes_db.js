const db = require("./config/db");

async function checkTaxes() {
    try {
        const [calendar] = await db.query("SELECT * FROM tax_calendar_events");
        console.log("CALENDAR EVENTS COUNT:", calendar.length);
        console.log("CALENDAR SAMPLE:", calendar.slice(0, 2));

        const [estimates] = await db.query("SELECT * FROM tax_estimates");
        console.log("ESTIMATES COUNT:", estimates.length);

        process.exit(0);
    } catch (err) {
        console.error("ERROR:", err.message);
        process.exit(1);
    }
}

checkTaxes();

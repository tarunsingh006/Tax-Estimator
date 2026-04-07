const mysql = require("mysql2/promise");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

console.log("ENV CHECK =>", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  pass: process.env.DB_PASSWORD,
  db: process.env.DB_NAME,
});

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

(async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ Connected to MySQL database successfully!");
    connection.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

module.exports = db;

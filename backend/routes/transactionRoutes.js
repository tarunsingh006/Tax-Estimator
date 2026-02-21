const express = require("express");
const router = express.Router();

console.log("✅ transactionRoutes file loaded");   // 👈 ADD THIS

const {
  addTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
  getTransactionSummary
} = require("../controllers/transactionController");
const authMiddleware = require("../middleware/authMiddleware");

// All transaction routes should be protected
router.use(authMiddleware);

// Add transaction
router.post("/", (req, res, next) => {
  console.log("👉 POST /api/transactions hit");
  next();
}, addTransaction);

// Get transactions by user ID
router.get("/:userId", (req, res, next) => {
  console.log("👉 GET /api/transactions/:userId hit");
  next();
}, getTransactions);

// Get summary for reports
router.get("/summary/:userId", (req, res, next) => {
  console.log("👉 GET /api/transactions/summary/:userId hit");
  next();
}, getTransactionSummary);

// Delete transaction
router.delete("/:id", (req, res, next) => {
  console.log("👉 DELETE /api/transactions/:id hit");
  next();
}, deleteTransaction);

// Update transaction
router.put("/:id", (req, res, next) => {
  console.log("👉 PUT /api/transactions/:id hit");
  next();
}, updateTransaction);

module.exports = router;

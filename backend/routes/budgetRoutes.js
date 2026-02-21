const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");
const authMiddleware = require("../middleware/authMiddleware");

// All budget routes should be protected
router.use(authMiddleware);

router.post("/", budgetController.addBudget);
router.get("/:userId", budgetController.getBudgets);
router.delete("/:id", budgetController.deleteBudget);

module.exports = router;

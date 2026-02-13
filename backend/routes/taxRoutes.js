const express = require("express");
const router = express.Router();
const taxController = require("../controllers/taxController");
const authMiddleware = require("../middleware/authMiddleware");

// All tax routes should be protected
router.use(authMiddleware);

router.post("/estimate", taxController.saveEstimate);
router.get("/estimates/:userId", taxController.getEstimates);
router.get("/calendar/:userId", taxController.getCalendarEvents);
router.post("/calendar", taxController.saveCalendarEvent);

module.exports = router;

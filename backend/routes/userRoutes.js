const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.put("/notifications", userController.updateNotifications);
router.put("/change-password", userController.changePassword);
router.delete("/delete-account", userController.deleteAccount);

module.exports = router;

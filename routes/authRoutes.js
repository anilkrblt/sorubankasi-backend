const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/update-password", authController.updatePassword);
router.put("/update-profile", authController.updateProfile);
router.post("/delete-account", authController.deleteAccount);
router.get("/user-groups", authController.getUserGroups);

module.exports = router;

const express = require("express");
const { signup, verifyEmail, forgotPassword, resetPassword, login, logout } = require("../controllers/auth.controller.js");

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;


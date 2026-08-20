const { MongoUserRepository } = require("../repositories/MongoUserRepository.js");
const { AuthService } = require("../services/AuthService.js");

const authService = new AuthService({
  repository: new MongoUserRepository(User),
});

// POST /api/auth/signup
async function signup(req, res) {
  try {
    const user = await authService.signup(req.body, res);
    res.status(201).json({ user });
  } catch (err) {
    console.error("signup error:", err.message);
    const status = err.message === "Email already registered" || err.message === "All fields are required" || err.message === "Passwords do not match"
      ? 400
      : 500;
    res.status(status).json({ error: err.message || "Internal server error" });
  }
}

// POST /api/auth/verify-email
async function verifyEmail(req, res) {
  try {
    const result = await authService.verifyEmail(req.body);
    res.json(result);
  } catch (err) {
    console.error("verifyEmail error:", err.message);
    const status = err.message === "Invalid or expired token" ? 400 : 500;
    res.status(status).json({ error: err.message || "Internal server error" });
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res) {
  try {
    const result = await authService.forgotPassword(req.body);
    res.json(result);
  } catch (err) {
    console.error("forgotPassword error:", err.message);
    const status = err.message === "User not found" ? 400 : 500;
    res.status(status).json({ error: err.message || "Internal server error" });
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
  try {
    const result = await authService.resetPassword(req.body);
    res.json(result);
  } catch (err) {
    console.error("resetPassword error:", err.message);
    const status = err.message === "Invalid OTP or expired" ? 400 : 500;
    res.status(status).json({ error: err.message || "Internal server error" });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const user = await authService.login(req.body, res);
    res.json({ user });
  } catch (err) {
    console.error("login error:", err.message);
    const status = err.message === "Invalid email or password" ? 400 : 500;
    res.status(status).json({ error: err.message || "Internal server error" });
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  try {
    const result = authService.logout(res);
    res.json(result);
  } catch (err) {
    console.error("logout error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { signup, verifyEmail, forgotPassword, resetPassword, login, logout };


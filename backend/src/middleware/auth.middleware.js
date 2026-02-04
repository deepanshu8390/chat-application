const jwt = require("jsonwebtoken");
const { User } = require("../models/User.js");

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("authMiddleware error:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { authMiddleware };


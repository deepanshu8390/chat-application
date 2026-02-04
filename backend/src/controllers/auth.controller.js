const bcrypt = require("bcryptjs");
const { User } = require("../models/User.js");
const { createTokenAndSetCookie } = require("../utils/createToken.js");
const { sendEmail } = require("../utils/email.js");
const crypto = require("crypto");

// POST /api/auth/signup
async function signup(req, res) {
  try {
    const { name, email, password, confirmPassword, mobile } = req.body;

    if (!name || !email || !password || !confirmPassword || !mobile) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashed, mobile });

    // Send confirmation email
    try {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetToken = token;
      user.resetExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      const confirmUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
      await sendEmail(
        email,
        "Welcome to ChatApplication - Verify Your Email",
        `Congratulations! Your account has been created. Please verify your email by clicking here: ${confirmUrl}`
      );
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
      // Continue without failing signup
    }

    createTokenAndSetCookie(user._id, res);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    console.error("signup error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/auth/verify-email
async function verifyEmail(req, res) {
  try {
    const { token } = req.body;
    const user = await User.findOne({
      resetToken: token,
      resetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.emailVerified = true;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();

    res.json({ message: "Email verified" });
  } catch (err) {
    console.error("verifyEmail error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetToken = otp;
    user.resetExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    try {
      await sendEmail(
        email,
        "ChatApplication - Password Reset OTP",
        `Your OTP for password reset is: ${otp}. Welcome back to ChatApplication!`
      );
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
      return res.status(500).json({ error: "Failed to send email" });
    }

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("forgotPassword error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({
      email,
      resetToken: otp,
      resetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid OTP or expired" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("resetPassword error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    createTokenAndSetCookie(user._id, res);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    console.error("login error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  res.clearCookie("jwt");
  res.json({ message: "Logged out" });
}

module.exports = { signup, verifyEmail, forgotPassword, resetPassword, login, logout };


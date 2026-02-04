const { User } = require("../models/User.js");

// GET /api/users
async function listUsers(req, res) {
  try {
    const currentUserId = req.user._id;
    const users = await User.find({ _id: { $ne: currentUserId } }).select(
      "-password -resetToken -resetExpires"
    );
    res.json(users);
  } catch (err) {
    console.error("listUsers error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { listUsers };


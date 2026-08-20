const { User } = require("../models/User.js");
const { MongoUserRepository } = require("../repositories/MongoUserRepository.js");
const { UserService } = require("../services/UserService.js");

const userService = new UserService({
  repository: new MongoUserRepository(User),
});

// GET /api/users
async function listUsers(req, res) {
  try {
    const users = await userService.listUsers(req.user._id);
    res.json(users);
  } catch (err) {
    console.error("listUsers error:", err.message);
    const status = err.message === "Not authenticated" ? 401 : 500;
    res.status(status).json({ error: err.message || "Internal server error" });
  }
}

module.exports = { listUsers };


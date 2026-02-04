const jwt = require("jsonwebtoken");

function createTokenAndSetCookie(userId, res) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: false, // ok for localhost; use true behind HTTPS in prod
    sameSite: "lax",
  });
}

module.exports = { createTokenAndSetCookie };


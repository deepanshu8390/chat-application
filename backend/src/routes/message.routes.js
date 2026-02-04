const express = require("express");
const { getMessages, sendMessage } = require("../controllers/message.controller.js");

const router = express.Router();

router.get("/:userId", getMessages);
router.post("/:userId", sendMessage);

module.exports = router;


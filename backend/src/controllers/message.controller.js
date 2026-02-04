const { Conversation } = require("../models/Conversation.js");
const { Message } = require("../models/Message.js");
const { getReceiverSocketId } = require("../socket.js");

// GET /api/messages/:userId
async function getMessages(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const conversation = await Conversation.findOne({
      members: { $all: [currentUserId, userId] },
    }).populate("messages");

    if (!conversation) return res.json([]);

    res.json(conversation.messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/messages/:userId
async function sendMessage(req, res) {
  try {
    const { text } = req.body;
    const { userId: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text) return res.status(400).json({ error: "Message text required" });

    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [senderId, receiverId],
        messages: [],
      });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text,
    });

    conversation.messages.push(message._id);
    await conversation.save();

    // 🔥 SOCKET.IO FIX
    const io = req.app.get("io");
    const receiverSocketId = getReceiverSocketId(receiverId.toString());

    if (receiverSocketId && io) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.status(201).json(message);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getMessages, sendMessage };

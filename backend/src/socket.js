// Very simple in-memory socket tracking, beginner friendly.

const onlineUsers = new Map(); // userId -> socketId

function registerSocketServer(io) {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      onlineUsers.set(userId, socket.id);
    }

    io.emit("onlineUsers", Array.from(onlineUsers.keys()));

    socket.on("disconnect", () => {
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      }
    });
  });
}

function getReceiverSocketId(userId) {
  return onlineUsers.get(userId);
}

function getOnlineUserIds() {
  return Array.from(onlineUsers.keys());
}

module.exports = { registerSocketServer, getReceiverSocketId, getOnlineUserIds };


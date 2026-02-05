
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js");
const messageRoutes = require("./routes/message.routes.js");
const { authMiddleware } = require("./middleware/auth.middleware.js");
const { registerSocketServer, getOnlineUserIds } = require("./socket.js");

// dotenv.config();

const app = express();
const server = http.createServer(app);

// Basic Socket.IO setup (logic moved into socket.js)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

registerSocketServer(io);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "okkk", onlineUsers: getOnlineUserIds() });
});

// Auth & chat APIs
app.use("/api/auth", require("./routes/auth.routes.js"));

app.use("/api/auth", authRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/messages", authMiddleware, messageRoutes);

// Connect database and start server
const PORT = process.env.PORT || 5000;
console.log("ENV CHECK:", process.env.MONGO_URI);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`Backend listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo connection error:", err.message);
    process.exit(1);
  });


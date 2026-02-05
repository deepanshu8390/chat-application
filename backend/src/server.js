require("dotenv").config();

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

const app = express();
const server = http.createServer(app);

/* ================== OPEN CORS (ALLOW ALL) ================== */
app.use(cors({
  origin: true,        // allow any origin
  credentials: true
}));

app.options("*", cors());

/* ================== OPEN SOCKET.IO ================== */
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
  },
});

app.set("io", io);
registerSocketServer(io);

/* ================== MIDDLEWARE ================== */
app.use(express.json());
app.use(cookieParser());

/* ================== ROUTES ================== */
app.get("/", (req, res) => {
  res.json({ status: "ok", onlineUsers: getOnlineUserIds() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/messages", authMiddleware, messageRoutes);

/* ================== SERVER START ================== */
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo connection error:", err.message);
    process.exit(1);
  });

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow your frontend URL in production
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Optional: In-memory storage of messages
const chatMessages = {}; // { roomId: [ { sender, text, time }, ... ] }

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a consultation room
  socket.on("join-room", ({ roomId, role }) => {
    if (!roomId) return;
    socket.join(roomId);
    console.log(`${role} joined room ${roomId}`);

    // Send previous messages if any
    if (chatMessages[roomId]) {
      socket.emit("receive-message", chatMessages[roomId]);
    } else {
      chatMessages[roomId] = [];
    }
  });

  // Handle sending messages
  socket.on("send-message", (msg) => {
    const rooms = Object.keys(socket.rooms).filter((r) => r !== socket.id);
    rooms.forEach((roomId) => {
      // Save message
      chatMessages[roomId].push(msg);
      // Broadcast to room
      io.to(roomId).emit("receive-message", msg);
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => console.log(`Socket.IO server running on port ${PORT}`));
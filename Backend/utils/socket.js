
import { Server } from "socket.io";

let io;
const userSocketMap = {}; // { userId: [socketId1, socketId2, ...] }

export const initsocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    const userId = socket.handshake.auth?.userId;
    if (userId) {
      if (!userSocketMap[userId]) userSocketMap[userId] = [];
      userSocketMap[userId].push(socket.id);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
      const disconnectedUserId = Object.keys(userSocketMap).find((key) =>
        userSocketMap[key].includes(socket.id)
      );
      if (disconnectedUserId) {
        userSocketMap[disconnectedUserId] = userSocketMap[disconnectedUserId].filter(
          (id) => id !== socket.id
        );
        if (userSocketMap[disconnectedUserId].length === 0)
          delete userSocketMap[disconnectedUserId];
      }

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
};

// Get all socket IDs for a user
export const getReceiverSockets = (userId) => userSocketMap[userId] || [];
export const getIO = () => io;

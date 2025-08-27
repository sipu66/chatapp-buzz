import { io } from "socket.io-client";

let socket = null;

const BACKEND_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:4000"
    : import.meta.env.VITE_BACKEND_URL?.replace("/api/v1", ""); 
    // remove /api/v1 because socket.io endpoint is usually on root

export const connectsocket = (userId) => {
  socket = io(BACKEND_URL, {
    auth: { userId },
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

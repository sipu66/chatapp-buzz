import { io } from "socket.io-client";

let socket = null;

export const connectsocket = (userId) => {
  socket = io(
    import.meta.env.MODE === "development" ? "http://localhost:4000" : "/",
    {
      auth: { userId }, // ✅ match backend
      withCredentials: true,
    }
  );

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

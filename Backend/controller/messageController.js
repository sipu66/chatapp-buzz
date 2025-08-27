import cacheAsyncError from "../middleare/cacheAsyncerror.js";
import User from "../models/user.js";
import Message from "../models/message.js";
import { v2 as cloudinary } from "cloudinary";
import { getReceiverSockets, getIO } from "../utils/socket.js";

// Get all users except logged-in
export const getAllUsers = cacheAsyncError(async (req, res, next) => {
  const user = req.user;
  const filteredUsers = await User.find({ _id: { $ne: user._id } }).select("-password");
  res.status(200).json({ success: true, data: filteredUsers });
});


// Send a message
export const sendMessage = cacheAsyncError(async (req, res, next) => {
  const { text } = req.body;
  const media = req.file ? req.file.path : null;
  const receiverId = req.params.id;
  const myId = req.user._id;

  const receiver = await User.findById(receiverId);
  if (!receiver) return res.status(404).json({ success: false, message: "User not found" });

  const sanitizedText = text?.trim() || "";
  if (!sanitizedText.length && !media)
    return res.status(400).json({ success: false, message: "Message text cannot be empty" });

  let mediaurl = "";
  if (media) {
    try {
      const uploadResponse = await cloudinary.uploader.upload(media, {
        resource_type: "auto",
        folder: "CHAT_APP_Media",
        transformation: { width: 1000, height: 1000, crop: "limit", quality: "auto", fetch_format: "auto" },
      });
      mediaurl = uploadResponse.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return res.status(500).json({ success: false, message: "Failed to upload media to cloudinary" });
    }
  }

  const newMessage = await Message.create({ senderId: myId, receiverId, text: sanitizedText, mediaurl });

  // Emit via socket to all sender & receiver tabs/devices
  const io = getIO();
  if (io) {
    const receiverSockets = getReceiverSockets(receiverId);
    const senderSockets = getReceiverSockets(myId);

    receiverSockets.forEach(socketId => io.to(socketId).emit("newMessage", newMessage));
    senderSockets.forEach(socketId => io.to(socketId).emit("newMessage", newMessage));
  }

  res.status(201).json({ success: true, message: "Message sent", data: newMessage });
});

// Delete a message
export const deleteMessage = cacheAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const myId = req.user._id;

  const message = await Message.findById(id);
  if (!message) return res.status(404).json({ success: false, msg: "Message not found" });

  if (message.senderId.toString() !== myId.toString())
    return res.status(403).json({ success: false, msg: "Not allowed" });

  await message.deleteOne();

  // Emit deletion event to all tabs/devices of receiver & sender
  const io = getIO();
  if (io) {
    const receiverSockets = getReceiverSockets(message.receiverId.toString());
    const senderSockets = getReceiverSockets(myId.toString());

    const payload = {
      _id: id,
      senderId: message.senderId,
      receiverId: message.receiverId,
    };

    receiverSockets.forEach(socketId => io.to(socketId).emit("messageDeleted", payload));
    senderSockets.forEach(socketId => io.to(socketId).emit("messageDeleted", payload));
  }

  res.json({ success: true, msg: "Message deleted" });
});


// Get messages with a specific user
export const getMessage = cacheAsyncError(async (req, res, next) => {
  const receiverId = req.params.id;
  const myId = req.user._id;

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId },
      { senderId: receiverId, receiverId: myId },
    ],
  }).sort({ createdAt: 1 });

  // ✅ Send in 'data' field to match frontend
  res.status(200).json({ success: true, data: messages });
});
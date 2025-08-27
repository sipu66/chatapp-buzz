import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Send } from "lucide-react";
import {
  fetchUsers,
  setOnlineUsers,
} from "../store/slices/authSlice";
import SelectedUserHeader from "./SelectedUserHeader";
import {
  setSelectedUser,
  addMessage,
  fetchMessages,
  deleteMessage,
} from "../store/slices/chatSlice";
import { getSocket } from "../lib/socket";
import { axiosInstance } from "../lib/axios";

const Home = () => {
  const dispatch = useDispatch();
  const { authUser, users = [], onlineUsers = [] } = useSelector(
    (state) => state.auth
  );
  const { selectedUser, messages, unreadMessages = {} } = useSelector(
    (state) => state.chat
  );

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  // Fetch users
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message) => dispatch(addMessage(message));
    const handleOnlineUsers = (onlineIds) =>
      dispatch(setOnlineUsers(onlineIds));
    const handleMessageDeleted = (data) => {
      const userId =
        data.senderId === authUser._id ? data.receiverId : data.senderId;
      dispatch(deleteMessage({ userId, messageId: data._id }));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("getOnlineUsers", handleOnlineUsers);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("getOnlineUsers", handleOnlineUsers);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [authUser, dispatch]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await axiosInstance.post(`/message/${selectedUser._id}`, {
        text: newMessage,
      });
      setNewMessage("");
    } catch (error) {
      console.error(
        "Failed to send message:",
        error.response?.data || error.message
      );
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await axiosInstance.delete(`/message/${messageId}`);
      dispatch(deleteMessage({ userId: selectedUser._id, messageId }));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 border-r h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Users</h2>
        {users.length > 0 ? (
          users.map((user) => {
            const unreadCount = unreadMessages[user._id] || 0;
            const lastMessage =
              messages[user._id]?.[messages[user._id].length - 1]?.text || "";

            return (
              <div
                key={user._id}
                onClick={() => {
                  dispatch(setSelectedUser(user));
                  dispatch(fetchMessages(user._id));
                }}
                className={`cursor-pointer py-2 px-3 rounded mb-1 flex justify-between items-center ${
                  selectedUser?._id === user._id
                    ? "bg-blue-200"
                    : "hover:bg-blue-100"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {user.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm text-white">
                      {user.fullname[0]}
                    </div>
                  )}
                  <span>{user.fullname}</span>
                  {onlineUsers.includes(user._id) && (
                    <span className="text-green-600">●</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {lastMessage && (
                    <span className="text-sm text-gray-500">
                      {lastMessage.slice(0, 10)}...
                    </span>
                  )}
                  {unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount} msg
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">No users found</p>
        )}
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col">
        {selectedUser && (
          <SelectedUserHeader
            selectedUser={selectedUser}
            onlineUsers={onlineUsers}
          />
        )}

        <div className="flex-1 p-4 overflow-y-auto">
          {selectedUser ? (
            messages[selectedUser._id]?.length > 0 ? (
              messages[selectedUser._id].map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 flex ${
                    msg.senderId === authUser._id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {msg.senderId !== authUser._id && (
                      <img
                        src={selectedUser.avatar?.url}
                        alt="avatar"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <span
                      className={`inline-block px-3 py-2 rounded-lg max-w-[60%] break-words ${
                        msg.senderId === authUser._id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      {msg.text}
                    </span>
                    {msg.senderId === authUser._id && (
                      <button
                        onClick={() => handleDelete(msg._id)}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center mt-10">
                No messages yet. Start chatting!
              </p>
            )
          ) : (
            <p className="text-gray-500 text-center mt-10">
              Select a user to start chatting
            </p>
          )}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Send Message */}
        {selectedUser && (
          <div className="p-4 border-t flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 mr-2 focus:outline-none focus:border-blue-500"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Send className="w-4 h-4 mr-1" /> Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

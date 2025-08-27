// chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (userId) => {
    const res = await axiosInstance.get(`/message/${userId}`);
    return { userId, messages: res.data.data };
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    selectedUser: null,
    messages: {}, // { userId: [] }
    unreadMessages: {}, // { userId: count }
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
      // reset unread count when opening chat
      if (state.unreadMessages[action.payload._id]) {
        state.unreadMessages[action.payload._id] = 0;
      }
    },
    addMessage: (state, action) => {
      const msg = action.payload;
      const userId =
        msg.senderId === state.selectedUser?._id ? msg.senderId : msg.receiverId;

      if (!state.messages[userId]) state.messages[userId] = [];
      state.messages[userId].push(msg);

      // if not currently viewing that user’s chat, increment unread
    //   if (
    //     !state.selectedUser ||
    //     (state.selectedUser && state.selectedUser._id !== msg.senderId)
    //   ) {
    //     state.unreadMessages[msg.senderId] =
    //       (state.unreadMessages[msg.senderId] || 0) + 1;
    //   }
    // },
    if (!state.selectedUser || state.selectedUser._id !== msg.senderId) {
    state.unreadMessages[msg.senderId] = (state.unreadMessages[msg.senderId] || 0) + 1;
  }
},
    deleteMessage: (state, action) => {
  const { userId, messageId } = action.payload;
  if (state.messages[userId]) {
    state.messages[userId] = state.messages[userId].filter(
      (msg) => msg._id !== messageId
    );
  }
},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.messages[action.payload.userId] = action.payload.messages;
    });
  },
});

export  const { setSelectedUser, addMessage,deleteMessage,} = chatSlice.actions;
export default chatSlice.reducer;

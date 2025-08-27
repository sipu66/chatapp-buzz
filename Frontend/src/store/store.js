import { configureStore } from "@reduxjs/toolkit"; 
import authReducer from "./slices/authSlice";
import chatReducer from "./slices/chatSlice"; // import chat slice

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer, // register chat slice
  },
});

export default store;

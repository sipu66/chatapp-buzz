import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
   avatar: {
    public_id: String,
    url: String
  }

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;

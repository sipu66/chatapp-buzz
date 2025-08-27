import generateToken from "../utils/jwt.js";
import cacheAsyncError from "../middleare/cacheAsyncerror.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

// Helper for cookie options
const cookieOptions = () => ({
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
  secure: process.env.NODE_ENV === "development" ? false : true,
});

// Signup
export const signup = cacheAsyncError(async (req, res, next) => {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password)
    return res.status(400).json({ success: false, message: "Please provide all fields" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ success: false, message: "Please provide a valid email" });

  if (password.length < 6)
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ success: false, message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullname,
    email,
    password: hashedPassword,
    avatar: { public_id: "", url: "" },
  });

  const token = generateToken(user);

  res
    .status(201)
    .cookie("token", token, cookieOptions())
    .json({ success: true, message: "User registered successfully", user, token });
});

// Signin
export const signin = cacheAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Please provide all fields" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const token = generateToken(user);
  res
    .status(200)
    .cookie("token", token, cookieOptions())
    .json({ success: true, message: "User logged in successfully", user, token });
});

// Signout
export const signout = cacheAsyncError(async (req, res, next) => {
  res.clearCookie("token", cookieOptions());
  return res.status(200).json({ success: true, message: "User logged out successfully" });
});

// Get current user
export const getUser = cacheAsyncError(async (req, res, next) => {
  const user = req.user;
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  return res.status(200).json({ success: true, user });
});

// Update profile
export const updateProfile = cacheAsyncError(async (req, res, next) => {
  const { fullname, email } = req.body;
  const file = req.file;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.fullname = fullname || user.fullname;
    user.email = email || user.email;

    if (file) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "avatars",
        transformation: [
          { width: 300, height: 300, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      });

      fs.unlinkSync(file.path);

      if (user.avatar && user.avatar.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      }

      user.avatar = { public_id: result.public_id, url: result.secure_url };
    }

    await user.save();
    const { password, ...userWithoutPassword } = user._doc;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
});

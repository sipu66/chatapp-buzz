import express from 'express';

const router = express.Router();
import { signup ,signin,signout,getUser,updateProfile} from '../controller/userController.js';
import isAuthenticated from '../middleare/authMidleware.js';
import upload from '../middleare/multer.js'
import User from "../models/user.js"; // make sure User is imported

router.get("/message/users", isAuthenticated, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("_id fullname avatar"); // corrected field name
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/signout',isAuthenticated ,signout);
router.get('/me', isAuthenticated,getUser);
router.put(
  "/update-profile",
  isAuthenticated,
  (req, res, next) => {
    console.log("Incoming request headers:", req.headers["content-type"]);
    next();
  },
  (req, res, next) => {
    upload.single("avatar")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  (req, res, next) => {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    next();
  },
  updateProfile
);





export default router;
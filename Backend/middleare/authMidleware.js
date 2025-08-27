import jwt from 'jsonwebtoken';
import  User from "../models/user.js";
import cacheAsyncError from './cacheAsyncerror.js';

const isAuthenticated = cacheAsyncError(async (req, res, next) => {
   const{token}= req.cookies;
   if(!token) {
    return res.status(401).json({
        success: false,
        message: "Please login to access this page"
    });
   }

   const decoded  =jwt.verify(token, process.env.JWT_SECRET_KEY);
   if(!decoded) {
    return res.status(401).json({
        success: false,
        message: "Invalid token, please login again"
    });
   }
   const user = await User.findById(decoded.id);
    if(!user) { 
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }
    req.user = user;
    next();
})
export default isAuthenticated;
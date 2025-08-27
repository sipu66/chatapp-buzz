import mongoose from "mongoose";


const dbconnect = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}

export default dbconnect;

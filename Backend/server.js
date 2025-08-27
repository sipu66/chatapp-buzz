import app from './app.js';
import {v2 as cloudinary} from 'cloudinary';
import dbconnect from './database/db.js';
dbconnect();
import dotenv from "dotenv";
import { initsocket } from './utils/socket.js';
dotenv.config();
import http from 'http';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
 const server = http.createServer(app);
 initsocket(server);


const PORT = process.env.PORT || 4000;  // fallback to 4000 if PORT is undefined

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});




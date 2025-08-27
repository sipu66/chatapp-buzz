import express, { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';    
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js'

dotenv.config({path: './config/.env'});


const app = express();



app.use(cors({
 origin: [process.env.FRONTEND_URL],
 credentials: true,
 methods: ['GET', 'POST', 'PUT', 'DELETE', ],
}))
app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));


app.use('/api/v1/', userRoutes);
app.use('/api/v1/message',messageRoutes)

export default app ;
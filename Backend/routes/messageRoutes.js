import express from 'express'
import {getAllUsers,sendMessage,getMessage,deleteMessage} from "../controller/messageController.js"
import isAuthenticated from '../middleare/authMidleware.js';

const router = express.Router();

router.get("/users",isAuthenticated,getAllUsers)
router.get('/:id',isAuthenticated,getMessage)
router.post("/:id",isAuthenticated,sendMessage)
router.delete("/:id",isAuthenticated, deleteMessage) 
router.get("/:id", isAuthenticated, getMessage);

export default router
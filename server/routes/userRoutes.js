import express from 'express';
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";
import { getUserData, getAllUsers, updateProfile } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get('/data',         userAuth,  getUserData);
userRouter.get('/all',          adminAuth, getAllUsers);
userRouter.put('/profile',      userAuth,  updateProfile);

export default userRouter;
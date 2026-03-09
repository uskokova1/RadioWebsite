import express from 'express';
import userAuth from "../middleware/userAuth.js";
import {getUserData, getAllUsers} from "../controllers/userController.js";
import adminAuth from "../middleware/adminAuth.js";

const userRouter = express.Router();

userRouter.get('/data', userAuth,getUserData);
userRouter.get('/all', adminAuth,getAllUsers);

export default userRouter;
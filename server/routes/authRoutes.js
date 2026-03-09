import express from 'express';
import {
    isAuthenticated,
    login,
    logout,
    register, resetPassword,
    sendResetOtp,
    sendVerifyOtp,
    verifyEmail
} from '../controllers/authController.js';
import userAuth from "../middleware/userAuth.js";
import {loginRateLimiter, emailRateLimiter} from '../middleware/rateLimiter.js';

const authRouter = express.Router();

authRouter.post('/register', register)
authRouter.post('/login', loginRateLimiter, login)
authRouter.get('/logout', logout)
authRouter.post('/send-verify-otp', userAuth, emailRateLimiter, sendVerifyOtp)
authRouter.post('/verify-account', userAuth, verifyEmail)
authRouter.get('/is-auth', userAuth, isAuthenticated)
authRouter.post('/send-reset-otp', emailRateLimiter, sendResetOtp)
authRouter.post('/reset-password', resetPassword)


export default authRouter;
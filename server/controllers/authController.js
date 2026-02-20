import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

export const register = async (req, res) => {
    const {username,email,password} = req.body;

    if(!username || !email || !password){
        return res.json({success:false, message:"Missing details" });
    }

    try{
        const existingUser = await userModel.findOne({email:email});

        if(existingUser){
            return res.json({success:true, message:"User already exists"});
        }

        const hassedPwd = await bcrypt.hash(password, 10);

        const user = new userModel({username,email,password:hassedPwd});
        await user.save();

        const token = jwt.sign({
            id: user._id},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '3d'});

        res.cookie('token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 3*24*160*60*1000
        })

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Welcome to WSIN!",
            text: `Welcome to WSIN's website, Your account has been created with email id: ${email}`,
        }
        await transporter.sendMail(mailOptions);

        return res.json({success: true})

    } catch (err){
        res.json({success:false, message:err.message});
    }
}

export const login = async (req, res) => {
    const {email,password} = req.body;

    if(!email || !password){
        return res.json({success:false, message:"Email and password required" });
    }

    try{
        const user = await userModel.findOne({email:email});
        if(!user){
            return res.json({success:false, message:"invalid email"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.json({success:false, message:"invalid password"});
        }

        const token = jwt.sign({
                id: user._id},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '3d'});

        res.cookie('token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 3*24*160*60*1000
        })

        return res.json({success: true})

    } catch (err){
        return res.json({success:false, message:err.message});
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({success:true, message:"Logged out"});
    } catch(err){
        return res.json({success:false, message:err.message});
    }
}

export const sendVerifyOtp = async (req, res) => {
    try{
        const {userId} = req.body;
        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({success:false, message:"Account already verified"});
        }

        const otp = String(Math.floor(100000+ Math.random() * 900000))
        user.verifyOtp = otp
        user.verifyOtpExpireAt = Date.now() + 10*60*1000

        await user.save();

        //console.log(transporter);
        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: "WSIN Account Verification",
            text: `Your code is ${otp}. Verify your account using this code`
        }

        await transporter.sendMail(mailOptions);

    } catch(err){
        console.log(err);
        return res.json({success:false, message:err.message});
    }
}

export const verifyEmail = async (req, res) => {
    const {userId, otp} = req.body;

    if(!userId || !otp){
        return res.json({success:false, message:"missing details"});
    }
    try{
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success:false, message:"user not found"});
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json({success: false, message: "invalid code"})
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success:false, message:"code expired"})
        }

        user.isAccountVerified = true;
        user.verifyOtp = ''
        user.verifyOtpExpiredAt = 0;

        await user.save()
        return res.json({success:true, message:"Email verified successfully"})

    }catch(err){
        return res.json({success:false, message:err.message});
    }
}

export const isAuthenticated = async (req, res) => {
    try{
        return res.json({success:true });
    }catch (err){
        return res.json({success:false, message:err.message});
    }
}

export const sendResetOtp = async (req, res) => {
    const {email} = req.body;
    if(!email){
        return res.json({success:false, message:"email required"});
    }
    try{
        const user = await userModel.findById(email);
        if (!user){
            return res.json({success:false, message:"user not found"});
        }

        const otp = String(Math.floor(100000+ Math.random() * 900000))
        user.resetOtp = otp
        user.resetOtpExpireAt = Date.now() + 15*60*1000

        await user.save();

        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: "WSIN Password Reset",
            text: `Your code for resetting your password is ${otp}. Use this code to reset your password`
        }
        await transporter.sendMail(mailOptions);

        return res.json({success:true, message:"Code sent to email"})

    }catch(err){
        return res.json({success:false, message:err.message});
    }
}

export const resetPassword = async (req, res) => {
    const {email, otp, newPassword} = req.body;

    if(!email || !newPassword || !otp){
        return res.json({success:false, message:"email, code, and new password required"});
    }

    try{
        const user = await userModel.findById(email);
        if(!user){
            return res.json({success:false, message:"user not found"});
        }
        if(user.resetOtp == "" || user.resetOtp !== otp){
            return res.json({success:false, message: "invalid OTP"})
        }
        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success:false, message:"code expired"})
        }
        const hashedPwd = await bcrypt.hash(newPassword, 10);
        user.password = hashedPwd;
        user.resetOtp = ''
        user.resetOtpExpireAt = 0;

        await user.save();
        return res.json({success:true, message:"Password reset successfully"})


    }catch(err){
        return res.json({success:false, message:err.message});
    }

}

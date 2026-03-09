import userModel from '../models/userModel.js';

export const getUserData = async (req, res) => {
    try{
        const {userId} = req.body;

        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success:false, message:"User not found"})
        }

        return res.json({
            success:true,
            userData:{
                name: user.username,
                isAccountVerified: user.isAccountVerified,
                role: user.role,
            }
        })

    }catch(err){
        return res.status(400).send({success:false, message:err.message});
    }
};

export const getAllUsers = async (req, res) => {
    try{
        const users = await userModel.find({}).select('username role email');

        if(!users){
            return res.json({success:false, message:"No users"})
        }

        return res.json(users)

    }catch(err){
        return res.status(400).send({success:false, message:err.message});
    }
};
import userModel from '../models/userModel.js';

export const getUserData = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        return res.json({
            success: true,
            userData: {
                _id:                user._id,
                name:               user.username,
                displayName:        user.displayName || user.username,
                email:              user.email,
                isAccountVerified:  user.isAccountVerified,
                role:               user.role,
                bio:                user.bio,
                avatar:             user.avatar,
                stickers:           user.stickers,
            }
        });

    } catch (err) {
        return res.status(400).send({ success: false, message: err.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select('username role email');
        if (!users) return res.json({ success: false, message: "No users" });
        return res.json(users);
    } catch (err) {
        return res.status(400).send({ success: false, message: err.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { userId, displayName, bio, stickers } = req.body;
        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: "User not found" });

        if (displayName !== undefined) user.displayName = displayName;
        if (bio !== undefined)         user.bio         = bio;
        if (stickers !== undefined)    user.stickers    = stickers;

        await user.save();

        return res.json({
            success: true,
            userData: {
                _id:                user._id,
                name:               user.username,
                displayName:        user.displayName || user.username,
                email:              user.email,
                isAccountVerified:  user.isAccountVerified,
                role:               user.role,
                bio:                user.bio,
                avatar:             user.avatar,
                stickers:           user.stickers,
            }
        });

    } catch (err) {
        return res.status(400).send({ success: false, message: err.message });
    }
};
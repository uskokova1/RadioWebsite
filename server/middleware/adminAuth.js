import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const adminAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({ success: false, message: 'Not authorized, login again' });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!tokenDecode.id) {
            return res.json({ success: false, message: 'Not authorized, login again' });
        }

        const user = await userModel.findById(tokenDecode.id);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.role !== 'admin') {
            return res.json({ success: false, message: 'Admin access required' });
        }

        if (!req.body) req.body = {};
        req.body.userId = tokenDecode.id;

        next();

    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

export default adminAuth;
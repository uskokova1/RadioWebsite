const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = require("../routes/authRoutes");

//@desc login
//@route POST /auth
//@access Public
const login = asyncHandler(async (req, res) => {
    const {username, password} = req.body;

    if(!username || !password){
        return res.status(400).json({Message: "All fields are required"})
    }

    const foundUser = await User.findOne({username}).exec()
    if(!foundUser){
        return res.status(401).json({Message: "unauthorized"})
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if(!match){
        return res.status(401).json({Message: "unauthorized"})
    }

    const accessToken = jwt.sign({
        "UserInfo": {
            "username": foundUser.username,
            "role": foundUser.role
        }
    }, process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: "30m"}
    )

    const refreshToken = jwt.sign(
        {"username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: "1d"}
    )

    res.cookie('jwt_rT', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 86400000 //1 day to match refresh token
    })

    res.cookie('jwt_aT', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 1800000
    })

    res.send({message: "cookies initialized"})

})

//@desc refresh
//@route GET /auth/refresh
//@access Public
const refresh = asyncHandler(async (req, res) => {
    const cookies = req.cookies;

    if(!cookies?.jwt_rT){
        return res.status(401).json({Message: "unauthorized"})
    }
    const refreshToken = cookies.jwt_rT

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if(err) return res.status(401).json({Message: "forbidden"})

            const foundUser = await User.findOne({username: decoded.username})

            if (!foundUser){return res.status(401).json({Message: "unauthorized"})}

            const accessToken = jwt.sign(
                {"UserInfo": {
                    "username": foundUser.username,
                        "role": foundUser.role
                    }},
                process.env.REFRESH_TOKEN_SECRET,
                {expiresIn: "30m"}
            )

            res.cookie('jwt_aT', accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 1800000
            })
        })
    )
})

//@desc logout
//@route POST /auth/logout
//@access Public
const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt_rT) return res.status(204)
    res.clearCookie('jwt_rT', {httpOnly: true, secure: true, sameSite: 'None'})
    res.clearCookie('jwt_aT', {httpOnly: true, secure: true, sameSite: 'None'})

    res.json({Message:"cookie cleared"})
}

module.exports = {
    login,
    refresh,
    logout
};
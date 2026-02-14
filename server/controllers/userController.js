const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

//@desc get all users
//@route GET /users
//@access Private
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean();
    if (!users?.length) {
        return res.status(400).json({message: 'No users found'});
    }
    res.json(users);
}) // -password means dont return password, lean means thin data to JSON

//@desc create new user
//@route POST /users
//@access Private
const createNewUser = asyncHandler(async (req, res) => {
    const {username, password, role} = req.body;

    if (!username || !password) {
        return res.status(400).json({message: 'Username or Password is required'});
    }
    const duplicate = await User.findOne({username}).lean().exec()

    if(duplicate) {
        return res.status(409).json({message: 'Username already exists'});
    }

    //hass password
    const hashedPwd = await bcrypt.hash(password, 10); //10 salt rounds

    const userObject = {username, "password": hashedPwd};

    //Create and store new user
    const user = await User.create(userObject)

    if (user) {
        res.status(201).json({message: `new user ${username} created`});
    } else{
        res.status(400).json({message: 'invalid user data'});
    }
})

//@desc update a users
//@route PATCH /users
//@access Private
const updateUser = asyncHandler(async (req, res) => {
    const {id, username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({message: 'all fields required'});
    }

    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({message: 'user not found'});
    }

    //check for dupe
    const duplicate = await User.findOne({username}).lean().exec()
    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({message: 'dupelicate username'});
    }

    user.username = username;

    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save()

    res.json ({message: `user ${updatedUser.username} updated`});
})

//@desc delete a users
//@route DELETE /users
//@access Private
const deleteUser = asyncHandler(async (req, res) => {
    const {id} = req.body;

    if (!id) {
        return res.status(400).json({message: 'user id required'});
    }
    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({message: 'user not found'});
    }

    const result = await user.deleteOne()
    const reply = `username ${result.username} with ID ${result.id} deleted`;
    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser,
}
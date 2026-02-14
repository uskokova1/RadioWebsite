const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const verifyJWT = require('../middleware/verifyJWT');
//router.use(verifyJWT);
//these 2 lines can be used to use the middleware in every route in the file

router.route('/')
.get(verifyJWT, userController.getAllUsers)
.post(userController.createNewUser)
.patch(verifyJWT, userController.updateUser)
.delete(verifyJWT, userController.deleteUser)

module.exports = router;
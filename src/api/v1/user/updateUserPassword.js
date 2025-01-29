const express = require('express');
const router = express.Router();
const User = require("@controller/userController")

router.post('/updateuserpassword',User.verifyToken, User.updatePassword);

module.exports = {
    router: router,
    name: 'updateuserpassword'
}

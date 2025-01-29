const express = require('express');
const router = express.Router();
const User = require("@controller/userController")

router.post('/updateUsername', User.verifyToken, User.updateUsername);

module.exports = {
    router: router,
    name: 'updateUsername'
}
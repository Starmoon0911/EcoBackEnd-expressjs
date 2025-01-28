const express = require("express");
const router = express.Router();
const User = require('@database/schemas/User');
const { verifyToken } = require('@controller/userController');
const { updateBalance } = require('@controller/userController');

router.post('/updateMoney', verifyToken, updateBalance);

module.exports = {
    router,
    name: 'updateMoney'
};
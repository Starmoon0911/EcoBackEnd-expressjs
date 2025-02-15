const express = require('express');
const router = express.Router();
const { createOrder } = require('@controller/orderController')
const { verifyToken } = require("@controller/userController")
router.post('/create', verifyToken, createOrder);

module.exports = {
    router,
    name: "create",
};
const express = require('express');
const router = express.Router();
const { createOrder } = require('@controller/orderController')
router.post('/create', createOrder);

module.exports = {
    router,
    name: "create",
};
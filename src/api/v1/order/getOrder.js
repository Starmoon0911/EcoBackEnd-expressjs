const express = require('express');
const router = express.Router();
const { getOrders } = require('@controller/orderController')
router.get('/get', getOrders);

module.exports = {
    router,
    name: "get",
};
const express = require('express');
const router = express.Router();
const { getUserOrders } = require('@controller/orderController')
router.get('/getUserOrder', getUserOrders);

module.exports = {
    router,
    name: 'getUserOrder'
};
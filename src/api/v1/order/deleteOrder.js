const express = require('express');
const router = express.Router();
const { deleteOrder } = require('@controller/orderController')
const { verifyToken } = require('@controller/userController');
router.post('/delete',verifyToken, deleteOrder);

module.exports = {
    router,
    name:"delete"
}
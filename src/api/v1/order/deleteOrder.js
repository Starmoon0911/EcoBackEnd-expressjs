const express = require('express');
const router = express.Router();
const { deleteOrder } = require('@controller/orderController')
router.delete('/delete', deleteOrder);

module.exports = {
    router,
    name:"delete"
}
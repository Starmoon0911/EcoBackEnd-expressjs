const express = require('express');
const router = express.Router();
const { deleteProduct } = require('@controller/productController')
const { verifyToken } = require('@controller/userController');
router.delete('/delete',verifyToken, deleteProduct)

module.exports = {
    router,
    name:'delete'
}
const express = require('express');
const router = express.Router();
const { deleteProduct } = require('@controller/productController')

router.delete('/delete', deleteProduct)

module.exports = {
    router,
    name:'delete'
}
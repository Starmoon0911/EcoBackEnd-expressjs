const { createProduct } = require('@controller/productController');
const express = require('express')
const router = express.Router()

router.post('/create', createProduct)

module.exports = {
    router,
    name: 'create'
}
const { createProduct } = require('@controller/productController');
const express = require('express')
const router = express.Router()
const ProductUploadHandler = require('../../../multer/product')
router.post('/create',ProductUploadHandler, createProduct)
module.exports = {
    router,
    name: 'create'
}
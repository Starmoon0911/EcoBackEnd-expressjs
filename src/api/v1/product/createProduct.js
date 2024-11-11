const { createProduct } = require('@controller/productController');
const express = require('express')
const router = express.Router()
const ProductUploadHandler = require('../../../multer/product')
const AvatarUploadHandler = require('../../../multer/avatar')
router.post('/create', ProductUploadHandler, createProduct)
module.exports = {
    router,
    name: 'create'
}
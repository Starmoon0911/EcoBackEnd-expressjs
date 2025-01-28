const { createProduct } = require('@controller/productController');
const express = require('express')
const router = express.Router()
const ProductUploadHandler = require('../../../multer/product')
const AvatarUploadHandler = require('../../../multer/avatar')
const { verifyToken } = require('@controller/userController')
router.post('/create',verifyToken, ProductUploadHandler, createProduct)
module.exports = {
    router,
    name: 'create'
}
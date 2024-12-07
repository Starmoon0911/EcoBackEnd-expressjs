const express = require('express');
const router = express.Router();
const { getProduct } = require('@controller/productController')
router.get('/get', getProduct)

module.exports = {
    router,
    name: "get"
};
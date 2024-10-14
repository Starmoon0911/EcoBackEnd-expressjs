const express = require('express');
const router = express.Router();
const { createCommet } = require('@controller/productController')

router.post('/:productId/commets', createCommet)

module.exports = { 
    router,
    name:":productId/commets"
};
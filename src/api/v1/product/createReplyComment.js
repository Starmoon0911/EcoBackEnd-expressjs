const express = require('express');
const router = express.Router();
const { createReplyCommet } = require('@controller/productController')

router.post('/:productId/commets/:commentId/replies', createReplyCommet)

module.exports = { 
    router,
    name:":productId/commets/:commentId/replies"
};
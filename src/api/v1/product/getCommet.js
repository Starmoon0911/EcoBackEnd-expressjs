const express = require('express')
const router = express.Router()
const { getCommet } = require('@controller/productController')

router.get('/:productId/commets', getCommet)

module.exports = {
    router,
    name:":productId/commets"
}

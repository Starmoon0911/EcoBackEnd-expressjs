const expres = require('express');
const router = expres.Router();
const { CompletOrder } = require('@controller/orderController')
const { verifyToken } = require('@controller/userController');
router.post('/complet',verifyToken, CompletOrder);

module.exports = {
    router,
    name: "complet",
};
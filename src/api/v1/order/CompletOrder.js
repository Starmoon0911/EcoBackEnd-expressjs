const expres = require('express');
const router = expres.Router();
const { CompletOrder } = require('@controller/orderController')

router.post('/CompletOrder', CompletOrder);

module.exports = {
    router,
    name: "complet",
};
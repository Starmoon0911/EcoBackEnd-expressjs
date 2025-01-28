const express = require('express');
const router = express.Router();

const { changerole,verifyToken } = require('@controller/userController')
router.post('/changerole',verifyToken, changerole);

module.exports = {
    router,
    name: 'changerole'
};
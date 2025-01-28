const express = require('express');
const router = express.Router();
const { getUser } = require('@controller/userController')
router.get('/', getUser);
module.exports = {
    router,
    name: ':id'
};
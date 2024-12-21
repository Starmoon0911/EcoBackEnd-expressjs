const express = require('express');
const router = express.Router();
const { getUser } = require('@controller/userController')
router.get('/:id', getUser);
module.exports = {
    router,
    name: ':id'
};
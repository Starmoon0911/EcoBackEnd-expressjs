const express = require('express');
const router = express.Router();
const { deleteUser } = require('@controller/userController')
const { verifyToken } = require("@controller/userController")
router.delete('/delete',verifyToken, deleteUser);

module.exports = {
    router,
    name:"delete"
}
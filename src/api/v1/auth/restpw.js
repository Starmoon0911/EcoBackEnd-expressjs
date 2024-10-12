//=/api/v1/auth/password/reset
const express = require('express');
const router = express.Router();
const resetpw = require('@root/src/controllers/resetpwController')
const authenticateJWT = require('@middleware/auth')

router.post('/password/reset', resetpw.resetPassword)

module.exports = {
    router,
    name:"password/reset"
};
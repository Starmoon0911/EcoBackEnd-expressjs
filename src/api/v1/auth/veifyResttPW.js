const express = require('express');
const router = express.Router();
const resetpw = require('@root/src/controllers/resetpwController')
const authenticateJWT = require('@middleware/auth')

router.post('/password/reset/veify', resetpw.verifyToken)

module.exports = router
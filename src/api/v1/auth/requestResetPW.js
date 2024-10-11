//name:/api/v1/auth/password/reset/request
const express = require('express');
const router = express.Router();
const resetpw = require('@root/src/controllers/resetpwController')


router.post('/password/reset/request', resetpw.requestResetPassword);

module.exports = router;


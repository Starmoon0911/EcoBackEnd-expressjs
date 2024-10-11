const express = require('express');
const router = express.Router();
const userController = require('@controller/userController'); // 引入用戶控制器

router.get('/avatar/:id', userController.getAvatar); // 確保這裡的路由設置正確

module.exports = router;

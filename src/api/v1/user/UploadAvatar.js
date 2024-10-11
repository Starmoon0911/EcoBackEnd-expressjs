const express = require('express');
const router = express.Router();
const userController = require('@controller/userController'); // 引入用戶控制器
const uploadHandler = require('@root/src/multer/avatar'); // 引入 multer

// 上傳頭像的路由
router.post('/avatar', uploadHandler, userController.uploadAvatar);
module.exports = router;

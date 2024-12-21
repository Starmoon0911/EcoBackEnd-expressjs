const User = require('@database/schemas/User'); // 使用者模型
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const log = require('@utils/logger')
const path = require('path')
const express = require('express')
const fs = require('fs');
const { ObjectId } = require('mongodb');
const { isValidObjectId } = require('mongoose');
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // 確保設置 JWT 密鑰

module.exports = {
    register: async (req, res) => {
        const { username, email, password } = req.body;

        // 確認所有必要欄位都有提供
        if (!username || !email || !password) {
            return res.status(400).json({ message: '所有欄位都是必填的' });
        }

        try {
            // 檢查電子郵件是否已存在
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: '電子郵件已被註冊' });
            }

            // 密碼加密
            const hashedPassword = await bcrypt.hash(password, 10);

            // 創建新使用者
            const newUser = new User({
                username,
                email,
                password: hashedPassword,
            });

            await newUser.save();
            log.info(`新的使用者創建${username}`)
            res.status(201).json({ message: '註冊成功' });
        } catch (error) {
            console.error(error);
            log.error(error)
            res.status(500).json({ message: '伺服器錯誤' });
        }
    },

    login: async (req, res) => {
        const { email, password, rememberMe } = req.body;
        const tokenExpiration = rememberMe ? process.env.JWT_EXPIRES_IN : process.env.JWT_DEF_EXPIRES_IN;

        if (!email || !password) {
            return res.status(400).json({ message: '電子郵件和密碼都是必填的' });
        }

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: '該電子郵件未註冊' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: '密碼錯誤' });
            }

            const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: tokenExpiration });
            res.status(200).json({ message: '登入成功', token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
        }
    },
    uploadAvatar: async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1]; // 從 Authorization 標頭提取 token

        if (!token) {
            return res.status(401).json({ message: '未提供授權令牌' });
        }

        let userId;
        try {
            const decoded = jwt.verify(token, JWT_SECRET); // 驗證 token
            userId = decoded.userId; // 提取 userId
        } catch (error) {
            return res.status(401).json({ message: '無效的授權令牌' });
        }

        if (!req.file) {
            return res.status(400).json({ message: '請上傳頭像圖片' });
        }

        const avatarPath = `/upload/avatar/${req.file.filename}`; // 獲取圖片相對路徑

        try {
            // 查找使用者
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: '使用者不存在' });
            }

            // 如果使用者有舊的頭像URL，則刪除舊的檔案
            if (user.avatarURL && user.avatarURL.length > 0) {
                const oldFilePath = path.join(__dirname, '../../upload/avatar', path.basename(user.avatarURL));
                fs.unlink(oldFilePath, (err) => {
                    if (err) {
                        log.error(`刪除舊頭像檔案時出錯: ${err}`);
                    } else {
                        log.info(`${user.username} 的舊頭像檔案已刪除`);
                    }
                });
            }

            // 更新頭像URL
            user.avatarURL = avatarPath;
            await user.save();

            log.info(`${user.username} 更新了頭像`);
            res.status(200).json({ message: '頭像更新成功', avatarURL: avatarPath });
        } catch (error) {
            console.error(error);
            log.error(error);
            res.status(500).json({ message: '伺服器錯誤' });
        }
    },
    getAvatar: async (req, res) => {
        const userID = req.params['id'];

        // 檢查 userID 是否存在
        if (!userID) {
            return res.status(400).json({ status: 400, message: 'userID is required for getting user avatar' });
        }
        if (!isValidObjectId(userID)) {
            return res.status(400).json({ status: 400, message: '哥們你的userID是甚麼ㄒㄧㄠˇ' })
        }
        try {
            const user = await User.findById(userID); // 確保使用 await
            if (!user) {
                return res.status(404).json({ status: 404, message: 'No User Found :<' });
            }

            // 返回用戶的頭像URL
            return res.status(200).json({ status: 200, message: `${req.protocol}://${req.get('host')}${user.avatarURL}` });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: '伺服器錯誤' });
        }
    },
    getUser: async (req, res) => {
        const userID = req.params['id'];
        if (!userID) {
            return res.status(400).json({ status: 400, message: 'userID is required for getting user avatar' });
        }
        if (!isValidObjectId(userID)) {
            return res.status(400).json({ status: 400, message: '哥們你的userID是甚麼ㄒㄧㄠˇ' })
        }
        try {
            const user = await User.findById(userID); // 確保使用 await
            if (!user) {
                return res.status(404).json({ status: 404, message: 'No User Found :<' });
            }
            return res.status(200).json({
                status:200,
                data:{
                    username:user.username,
                    email:user.email,
                    avatarURL:`${req.protocol}://${req.get('host')}${user.avatarURL}`,
                    role:user.role,
                    createdAt:user.createdAt,
                    updatedAt:user.updatedAt
                }
            })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: '伺服器錯誤' });
        }
    }
}

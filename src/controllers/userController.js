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
    verifyToken: (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: '未提供授權令牌' });
        }
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.userId = decoded.userId;
            next();
        } catch (error) {
            return res.status(401).json({ message: '無效的授權令牌' });
        }
    },
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
        const userID = req.query['id'];

        if (userID && !isValidObjectId(userID)) {
            return res.status(400).json({ status: 400, message: '哥們你的userID是甚麼ㄒㄧㄠˇ' })
        }
        try {
            const user = userID ? await User.findById(userID) : await User.find({}); // 確保使用 await
            if (!user || (Array.isArray(user) && user.length === 0)) {
                return res.status(404).json({ status: 404, message: 'No User Found :<' });
            }

            if (Array.isArray(user)) {
                // 如果是陣列，遍歷並格式化每個用戶資料
                const formattedUsers = user.map((u) => ({
                    id: u._id,
                    username: u.username,
                    email: u.email,
                    avatarURL: `${req.protocol}://${req.get('host')}${u.avatarURL}`,
                    role: u.role,
                    balance: u.balance,
                    createdAt: u.createdAt,
                    updatedAt: u.updatedAt
                }));

                return res.status(200).json({
                    status: 200,
                    data: formattedUsers // 返回格式化後的用戶陣列
                });
            } else {
                // 單個用戶的情況
                return res.status(200).json({
                    status: 200,
                    data: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        avatarURL: `${req.protocol}://${req.get('host')}${user.avatarURL}`,
                        role: user.role,
                        balance: user.balance,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    }
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: '伺服器錯誤' });
        }
    },
    changerole: async (req, res) => {
        const { id, role } = req.body;

        try {
            const owner = await User.findById(req.userId);
            if (owner.role !== 'admin') {
                return res.status(401).json({ status: 401, message: 'You are not authorized to delete user' });
            }
        } catch (error) {
            log.error(error);
            return res.status(500).json({ status: 500, message: '伺服器錯誤' });

        }
        if (!id || !role) {
            return res.status(400).json({ status: 400, message: 'id and role are required' });
        }
        if (role !== 'admin' && role !== 'customer') {
            return res.status(400).json({ status: 400, message: 'role must be either admin or customer' });
        }
        if (!isValidObjectId(id)) {
            return res.status(400).json({ status: 400, message: '哥們你的id是甚麼ㄒㄧㄠˇ' })
        }
        try {
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ status: 404, message: 'No User Found :<' });
            }

            user.role = role;
            await user.save();

            return res.status(200).json({ status: 200, message: 'User role updated successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: '伺服器錯誤' });
        }
    },
    deleteUser: async (req, res) => {
        const { id } = req.query;
        try {
            const owner = await User.findById(req.userId);
            if (owner.role !== 'admin') {
                return res.status(401).json({ status: 401, message: 'You are not authorized to delete user' });
            }
        } catch (error) {
            log.error(error);
            return res.status(500).json({ status: 500, message: '伺服器錯誤' });

        }
        if (!id) {
            return res.status(400).json({ status: 400, message: 'id is required' });
        }
        if (!isValidObjectId(id)) {
            return res.status(400).json({ status: 400, message: '哥們你的id是甚麼ㄒㄧㄠˇ' })
        }
        try {
            const user = await User.findByIdAndDelete(id);
            if (!user) {
                return res.status(404).json({ status: 404, message: 'No User Found :<' });
            }
            res.status(200).json({ status: 200, message: 'User deleted successfully' });

        } catch (error) {
            log.error(error);
            return res.status(500).json({ status: 500, message: '伺服器錯誤' });
        }
    },
    updateBalance: async (req, res) => {
        const { userId, balance } = req.body;
        if (!userId || !balance || !isValidObjectId(userId)) {
            return res.status(400).json({ status: 400, message: 'userId and balance are required' });
        }
        if (!Number.isInteger(balance) || balance < 0) {
            return res.status(400).json({ status: 400, message: 'balance must be a positive integer' });
        }
        try {
            const owner = await User.findById(req.userId);
            if (owner.role !== 'admin') {
                return res.status(401).json({ status: 401, message: 'You are not authorized to update balance' });
            }
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ status: 404, message: 'No User Found :<' });
            }
            user.balance = balance;
            await user.save();
            return res.status(200).json({ status: 200, message: 'User balance updated successfully' });
        } catch (error) {
            log.error(error);
            return res.status(500).json({ status: 500, message: '伺服器錯誤' });
        }
    },
    updateUsername: async (req, res) => {
        const { userId, username } = req.body;
        try {
            const owner = await User.findById(req.userId);
            if (owner.id.toString() !== userId) {
                return res.status(401).json({ status: 401, message: 'You are not authorized to update username' });
            }
        } catch (error) {
            log.error(error);
            return res.status(500).json({ status: 500, message: '伺服器錯誤' });
        }

        if (!userId || !username || !isValidObjectId(userId)) {
            return res.status(400).json({ status: 400, message: 'userId and username are required' });
        }
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ status: 404, message: 'No User Found :<' });
            }
            user.username = username;
            await user.save();
            return res.status(200).json({ status: 200, message: 'User username updated successfully' });
        } catch (error) {
            log.error(error);
            return res.status(500).json({ status: 500, message: '伺服器錯誤' });
        }
    },
    updatePassword: async (req, res) => {
        const { originalPassword, newPassword,userId } = req.body;
        try {
            const owner = await User.findById(req.userId);
            const isMatch = await bcrypt.compare(originalPassword, owner.password);
            if (owner.id.toString() !== userId || !isMatch) {
                return res.status(401).json({ status: 401, message: 'You are not authorized to update password' });
            }
        } catch (error) {
            log.error(error);
            return res.status(500).json({ status: 500, message: '伺服器錯誤' });
        }
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ status: 404, message: 'No User Found :<' });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();
            return res.status(200).json({ status: 200, message: 'User password updated successfully' });
        } catch (error) {
            log.error(error);
            return res.status(500).json({ status: 500, message: '伺服器錯誤' });
        }
    }
}
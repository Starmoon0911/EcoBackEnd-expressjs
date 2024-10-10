const User = require('@database/schemas/User'); // 使用者模型
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

            res.status(201).json({ message: '註冊成功' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '伺服器錯誤' });
        }
    },

    login: async (req, res) => {
        const { email, password, rememberMe } = req.body;
        const _day = rememberMe ? process.env.JWT_EXPIRES_IN : process.env.JWT_DEF_EXPIRES_IN 
        // 驗證輸入
        if (!email || !password) {
            return res.status(400).json({ message: '電子郵件和密碼都是必填的' });
        }

        try {
            // 查找使用者
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: '使用者不存在或密碼錯誤' });
            }

            // 密碼比較
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: '使用者不存在或密碼錯誤' });
            }

            // 生成 JWT 令牌
            const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: _day });

            res.status(200).json({ message: '登入成功', token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '伺服器錯誤' });
        }
    }
};

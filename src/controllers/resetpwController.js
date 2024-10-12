const User = require('@database/schemas/User'); // 用戶模型
const ResetToken = require('@database/schemas/ResetToken');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const generateRandomCode = require('@utils/generateRandomCode');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const log = require('@utils/logger')

const { ObjectId } = require('mongodb')
const { isValidObjectId } = require('mongoose')
// 創建重置密碼請求的 API
module.exports = {
    resetPassword: async (req, res) => {
        const { userId, newPassword } = req.body;
        try {
            if (!isValidObjectId(userId)) {
                return res.status(400).json({ message: 'userId不是正確的格式' })
            }
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: '用戶不存在' });
            }

            // 密碼加密
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();

            return res.status(200).json({ message: '密碼重置成功' });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ message: '無效的或過期的 token' });
        }
    },
    verifyToken: async (req, res) => {
        const { token } = req.body;

        try {
            const code = await ResetToken.findOne({ code: token }); // 使用 await
            if (!code) {
                return res.status(403).json({ message: 'Unknown reset token' });
            }

            const tenMinutesInMilliseconds = 10 * 60 * 1000; // 10 分鐘轉換為毫秒
            const now = new Date(); // 獲取當前時間
            const codeCreateAt = new Date(code.createAt);

            // 檢查 token 是否過期
            if ((now - codeCreateAt) > tenMinutesInMilliseconds) {
                await code.delete(); // 確保使用 await
                return res.status(403).json({ message: "Reset token can't be used now" });
            }
            res.status(200).json({ message: 'Verified' });
            await code.delete()
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    requestResetPassword: async (req, res) => {
        const { email } = req.body;
        const code = await generateRandomCode({ upper: true, lower: true, num: true, length: 100 })
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: '用戶不存在' });
            }

            // 生成 token，有效期設為 1 小時
            const token = new ResetToken({
                code: code,
                userId: user._id
            })
            await token.save()
            // // 創建發送電子郵件的傳輸器
            // const transporter = nodemailer.createTransport({
            //     service: 'gmail', // 使用 Gmail
            //     auth: {
            //         user: process.env.EMAIL_USER, // 你的郵箱
            //         pass: process.env.EMAIL_PASS  // 你的郵箱密碼或應用程序密碼
            //     }
            // });

            // // 設定電子郵件內容
            // const mailOptions = {
            //     from: process.env.EMAIL_USER,
            //     to: email,
            //     subject: '重置密碼請求',
            //     text: `請點擊以下鏈接重置您的密碼：\n${process.env.frontEndURL}/verify/${token}`
            // };

            // 發送電子郵件
            // await transporter.sendMail(mailOptions);
            return res.status(200).json({ message: '重置密碼郵件已發送' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: '伺服器錯誤' });
        }
    }
}
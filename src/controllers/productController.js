require('dotenv').config();
const Product = require('@database/schemas/product');
const User = require('@database/schemas/User');
const { ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')
const { isValidObjectId } = require('mongoose')
const log = require('@utils/logger')
const JWT_SECRET = process.env.JWT_SECRET
module.exports = {
    createCommet: async (req, res) => {
        const { username, content, tags } = req.body;
        const { productId } = req.params;

        try {
            const product = await Product.findById(productId);
            if (!product) return res.status(404).json({ message: 'Product not found.' });
            const newComment = {
                username,
                content,
                tags,
                createdAt: Date.now(),
            };
            product.comments.push(newComment);
            await product.save();
            res.status(201).json({ newComment });
        } catch (error) {
            res.status(500).send('Server error.');
        }
    },
    createReplyCommet: async (req, res) => {
        const { username, content } = req.body;
        const { productId, commentId } = req.params;

        try {
            const product = await Product.findById(productId);
            if (!product) return res.status(404).send('Product not found.');

            const comment = product.comments.id(commentId);
            if (!comment) return res.status(404).send('Comment not found.');

            const newReply = {
                username,
                content,
                createdAt: Date.now(),
            };

            comment.replies.push(newReply);
            await product.save();
            res.status(201).json(newReply);
        } catch (error) {
            res.status(500).send('Server error.');
        }
    },
    getCommet: async (req, res) => {
        const { productId } = req.params;
        const { page = 1 } = req.query;

        if (!isValidObjectId(productId)) {
            return res.status(400).json({ message: 'productId 不是正確的格式' });
        }

        try {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: '未找到商品' });
            }

            const comments = await Product.findById(productId)
                .select('comments') // 僅選擇留言
                .slice('comments', [(page - 1) * 5, 5]); // 使用 Mongoose 的 slice 方法

            res.status(200).json(comments);
        } catch (error) {
            res.status(500).json({ message: '伺服器錯誤' });
        }
    },
    createProduct: async (req, res) => {
        const { name, description, price, category, stock, tags } = req.body;
        if ([name, description, price, category, stock].some(param => !param)) {
            return res.status(400).json({ status: 400, message: '缺少必要參數' });
        }

        try {
            const newProduct = new Product({
                name,
                description,
                price,
                category,
                stock,
                tags
            });
            await newProduct.save();
            log.info(`新的商品已創建: ${newProduct.name}`);
            res.status(201).json({ status: 201, message: newProduct });
        } catch (error) {
            log.error(error);
            res.status(500).json({ status: 500, message: "Server Error" });
        }
    },
    deleteProduct: async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1];
        const { productId } = req.body;
        try {
            const decoded = jwt.verify(token, JWT_SECRET); // 驗證 token
            userId = decoded.userId; // 提取 userId
        } catch (error) {
            return res.status(401).json({ message: '無效的授權令牌' });
        }

        if (!userId) {
            return res.status(401).json({ message: "你尚未登入" });
        }

        const user = await User.findById(userId);
        if (!user.role || user.role != "admin") {
            return res.status(403).json({ message: "未經授權" });
        }
        if (!isValidObjectId(productId)) {
            res.status(400).json({ message: "未知的productID" })
        }
        const product = await Product.findById(productId);
        if (!product) {
            res.status(404).json({ message: "這筆商品可能已經被刪除了!" })
        }
        try {
            log.info(`刪除了一筆商品:${product.name}`)
            await product.deleteOne();
            res.status(200).json({ message: '成功刪除' })
        } catch (error) {
            log.error('刪除商品時出現錯誤' + error)
            res.status(500).json({ message: "發生錯誤" })
        }
    }
}
const { isValidObjectId } = require('mongoose')
const Order = require('@database/schemas/order');
const config = require('../../config.json');
const Product = require('@database/schemas/product');
const User = require('@database/schemas/User');
const log = require('@utils/logger');
const axios = require('axios');

module.exports = {
    createOrder: async (req, res) => {
        const { userId, productId, quantity } = req.body;
        if (!isValidObjectId(userId) || !isValidObjectId(productId) || !quantity) {
            return res.status(400).json({ message: 'Invalid request.' });
        }
        try {
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: 'User not found.' });
            const product = await Product.findById(productId);
            if (!product) return res.status(404).json({ message: 'Product not found.' });

            const newOrder = new Order({
                userId,
                productId,
                quantity
            });
            await newOrder.save();
            log.info(`創建新訂單:${newOrder.productId}`);
            user.balance -= product.price * quantity;
            product.stock -= quantity;
            await product.save();
            await user.save();
            log.info(`更新使用者餘額:${user.username} -> ${user.balance}`);
            log.info(`更新商品庫存:${product.name} -> ${product.stock}`);

            if (config.enbaleDiscordWebhook) {
                axios.post(config.url.OrderNotify, {
                    content: `<@576666559439699981>\n創建新訂單:${newOrder.productId}`,
                    embeds: [{
                        title: "新訂單創建",
                        description: `訂單 ID: ${newOrder._id}\n產品: ${product.name}\n數量: ${quantity}\n使用者: ${user.username}`,
                        color: 3447003, // 設定顏色 (藍色)
                        fields: [
                            {
                                name: '產品價格',
                                value: `${product.price} 元`,
                                inline: true
                            },
                            {
                                name: '總金額',
                                value: `${product.price * quantity} 元`,
                                inline: true
                            },
                        ],
                        timestamp: new Date(),
                        footer: {
                            text: '訂單系統',
                        },
                    }]
                });
            }

            res.status(201).json({ message: "success", data: newOrder });
        } catch (error) {
            res.status(500).send('Server error.');
            log.error(error);
        }
    },

    getUserOrders: async (req, res) => {
        const { id } = req.query;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'UserId is not correct format' });
        }
        try {
            const orders = await Order.find({ userId: id }).exec();
            res.status(200).json({ message: "success", data: orders });
        } catch (error) {
            log.error(error);
            res.status(500).send('Server error.');
        }
    },

    getOrders: async (req, res) => {
        const { limit = 10, page = 1, OrderId = null } = req.query;
        if (OrderId && !isValidObjectId(OrderId)) {
            return res.status(400).json({ message: 'OrderId is not correct format' });
        }
        try {
            const orders = OrderId ? await Order.findById(OrderId)
                : await Order.find().limit(limit * 1).skip((page - 1) * limit).exec();
            res.status(200).json({ message: "success", data: orders });
        } catch (error) {
            res.status(500).send('Server error.');
            log.error(error);
        }
    }, 

    deleteOrder: async (req, res) => {
        const { OrderId } = req.body;

        if (!isValidObjectId(OrderId)) {
            return res.status(400).json({ message: 'OrderId is not correct format' });
        }
        
        try {
            const order = await Order.findById(OrderId);
            if (!order) return res.status(404).json({ message: 'Order not found.' });
            if (order.isCompleted) {
                return res.status(400).json({ message: 'This order is already completed' });
            }
            if (order.userId.toString() !== req.userId) {
                console.log(order.userId, req.userId);
                return res.status(401).json({ message: 'You are not authorized to delete this order' });
            }
            await Order.findByIdAndDelete(OrderId);
            log.info(`刪除訂單:${order.productId}`);
            res.status(200).json({ message: "success" });
            if (config.enbaleDiscordWebhook) {
                axios.post(config.url.OrderNotify, {
                    content: `<@576666559439699981>\n訂單刪除:${order.productId}`,
                    embeds: [{
                        title: "訂單已刪除",
                        description: `訂單 ID: ${order._id}\n已刪除的產品: ${order.productId}`,
                        color: 15158332, // 紅色
                        timestamp: new Date(),
                        footer: {
                            text: '訂單系統',
                        },
                    }]
                });
            }
        } catch (error) {
            res.status(500).send('Server error.');
            log.error(error);
        }
    },

    CompletOrder: async (req, res) => {
        const { OrderId } = req.body;
        try {
            const owner = await User.findById(req.userId);
            if (owner.role !== 'admin') {
                return res.status(401).json({ status: 401, message: 'You are not authorized to delete user' });
            }
        } catch (error) {
            log.error(error);
            return res.status(500).json({ status: 500, message: '伺服器錯誤' });

        }
        if (!isValidObjectId(OrderId)) {
            return res.status(400).json({ message: 'OrderId is not correct format' });
        }
        try {
            const order = await Order.findById(OrderId);
            if (!order) return res.status(404).json({ message: 'Order not found.' });
            order.isCompleted = true;
            await order.save();
            log.info(`訂單完成:${order.productId}`);

            if (config.enbaleDiscordWebhook) {
                axios.post(config.url.OrderNotify, {
                    content: `訂單完成:${order.productId}`,
                    embeds: [{
                        title: "訂單已完成",
                        description: `訂單 ID: ${order._id}\n完成的產品: ${order.productId}`,
                        color: 3066993, // 綠色
                        timestamp: new Date(),
                        footer: {
                            text: '訂單系統',
                        },
                    }]
                });
            }
            res.status(200).json({ message: "success" });
        } catch (error) {
            res.status(500).send('Server error.');
            log.error(error);
        }
    }
};

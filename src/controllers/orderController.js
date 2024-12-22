const { isValidObjectId } = require('mongoose')
const Order = require('@database/schemas/order');

const Product = require('@database/schemas/product');
const User = require('@database/schemas/User');
const log = require('@utils/logger');

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
            res.status(201).json({ message: "success", data: newOrder });
        } catch (error) {
            res.status(500).send('Server error.');
            log.error(error);
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
        const { OrderId } = req.params;
        if (!isValidObjectId(OrderId)) {
            return res.status(400).json({ message: 'OrderId is not correct format' });
        }
        try {
            const order = await Order.findByIdAndDelete(OrderId);
            if (!order) return res.status(404).json({ message: 'Order not found.' });
            log.info(`刪除訂單:${order.productId}`);
            res.status(200).json({ message: "success" });
        } catch (error) {
            res.status(500).send('Server error.');
            log.error(error);
        }
    },
    CompletOrder: async (req, res) => {
        const { OrderId } = req.body;
        if (!isValidObjectId(OrderId)) {
            return res.status(400).json({ message: 'OrderId is not correct format' });
        }
        try {
            const order = await Order.findById(OrderId);
            if (!order) return res.status(404).json({ message: 'Order not found.' });
            order.isCompleted = true;
            await order.save();
            log.info(`訂單完成:${order.productId}`);
            res.status(200).json({ message: "success" });
        } catch (error) {
            res.status(500).send('Server error.');
            log.error(error);
        }
    }
};

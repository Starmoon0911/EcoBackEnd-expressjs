const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const CommentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    tags: {
        type: [String],
        default: [],
    },
    replies: [ReplySchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    tags: {
        type: [String],
        default: [],
    },
    images: {
        type: [String], // 儲存多張圖片的路徑或 URL
        default: [],
    },
    comments: {
        type: [CommentSchema],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

ProductSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;

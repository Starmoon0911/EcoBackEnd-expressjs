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
        type: [String],  // 儲存關鍵字
        default: [],
    },
    replies: [ReplySchema],  // 新增的回覆屬性
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Schema = new mongoose.Schema({
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
        type: [String],  // 儲存產品標籤
        default: [],
    },
    comments: {
        type: [CommentSchema],
        default: []
    },  // 嵌套留言 Schema
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

Schema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Product = mongoose.model('Product', Schema);

module.exports = Product;

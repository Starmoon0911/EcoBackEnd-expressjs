const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    code: {
        type: String,
        require: true
    },
    userId: {
        type: String,
        require:true
    },
    createAt: {
        type: Date,
        default: new Date()
    }
})

const ResetToken = mongoose.model("ResetToken", Schema)

module.exports = ResetToken
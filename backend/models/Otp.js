const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // 5 minutes (in seconds)
    }
})

// This creates a TTL (Time To Live) index
// this will automatically deleted after 5 minutes
module.exports = mongoose.model('Otp', otpSchema);
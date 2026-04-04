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
    type: {
        type: String,
        required: true,
        enum: ['emailVerification']
    },
    attempts :{
        type: Number,
        default: 0,
        max: [10, 'exceeds maximum allowed attempts(10)'],
        required: true
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
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['emailVerification']
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900 // 15 minutes (in seconds)
    }
});

// This creates a TTL (Time To Live) index
// this will automatically deleted after 15 minutes
module.exports = mongoose.model('Token', tokenSchema);
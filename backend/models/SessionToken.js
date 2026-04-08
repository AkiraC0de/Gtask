const mongoose = require('mongoose');

const sessionTokenSchema = new mongoose.Schema({
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

sessionTokenSchema.methods.isAuthorizedForNewToken = () => {
    const COOLDOWN_TIME_IN_MS = 1 * 60 * 1000; // 1 minute

    const timeDifference = new Date() - this.createdAt; // Result is in milliseconds

    return timeDifference > COOLDOWN_TIME_IN_MS;
}

// This creates a TTL (Time To Live) index
// this will automatically deleted after 15 minutes
module.exports = mongoose.model('SessionToken', sessionTokenSchema);
const mongoose = require('mongoose');
const crypto = require('crypto');
const GenericError = require('../errors/GenericError');
const ERROR_CODES = require('../constants/errorCodes');

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

otpSchema.methods.compareOtp = async function(otp) {
    const hashedOtp = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    const isVerified = hashedOtp === this.otp;

    if (!isVerified) {
        await this.incrementOtpAttempt();
    } else {
        await this.deleteOne(); 
    }
    
    return isVerified;
}

otpSchema.methods.incrementOtpAttempt = async function() {
    const MAX_ATTEMPTS = 5;

    this.attempts += 1;

    if (this.attempts >= MAX_ATTEMPTS) {
        await this.deleteOne(); 
        throw new GenericError(429, "Maximum attempts exceeded. OTP invalidated.", ERROR_CODES.REACHED_MAX_ATTEMPS);
    }

    return await this.save();
};

// This creates a TTL (Time To Live) index
// this will automatically deleted after 5 minutes
module.exports = mongoose.model('Otp', otpSchema);
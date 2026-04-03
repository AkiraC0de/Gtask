const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },
    middleName: {
        type: String,
        trim: true,
        minlength: 2
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true
});

// Add Time To Live (TTL) for unverified accounnts
// expireAfterSeconds: 900 (15 minutes)
userSchema.index(
  { createdAt: 1 }, 
  { 
    expireAfterSeconds: 900, 
    partialFilterExpression: { isVerified: false } 
  }
);

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Security feature: 
// Middleware to hash the password
// before saving to the database
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    const password = String(this.password);
    this.password = await bcryptjs.hash(password, 10);
    next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
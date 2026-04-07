const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
    return jwt.sign({
        _id: user._id,
        email: user.email,
        role: user.role
    }, 
    process.env.JWT_ACCESSTOKEN,
    {
        expiresIn: '15m'
    })
}

const generateRefreshToken = (user) => {
    return jwt.sign({
        _id: user._id,
    }, 
    process.env.JWT_REFRESHTOKEN,
    {
        expiresIn: '15d'
    })
}

module.exports = { 
    generateAccessToken, 
    generateRefreshToken, 
};
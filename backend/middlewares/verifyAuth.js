const jwt = require('jsonwebtoken');
const UnathorizeError = require('../errors/UnuthorizeError');
const ERROR_CODES = require('../constants/errorCodes');

const verifyAuth = (req, res, next) => {
    const authorization = req.headers.authorization || req.headers.Authorization;
    if(!authorization) {
        throw new UnathorizeError('Authorization in request headers is required.');
    }
    
    if(!authorization.startsWith('Bearer ')) {
        throw new UnathorizeError('Invalid Authorization format. Valid : Bearer <token>');
    }
    // Extract the token from authorization
    const token = authorization.split(' ')[1];

    // Validate the access token
    jwt.verify(token, process.env.JWT_ACCESSTOKEN, (err, user) => {
        if(err) {
            throw new UnathorizeError('Access Token has Expired or is Invalid.', ERROR_CODES.INVALID_TOKEN);
        }

        req.user = user;
        next();
    });
}

module.exports = verifyAuth;
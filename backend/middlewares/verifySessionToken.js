const crypto = require('crypto');
const SessionToken = require('../models/SessionToken');
const UnathorizeError = require('../errors/UnuthorizeError');
const ERROR_CODES = require('../constants/errorCodes');

const verifySessionToken = async (req, res, next) => {
  const authorization = req.headers.authorization || req.headers.Authorization;
  if(!authorization) {
    throw new UnathorizeError('Authorization in request headers is required.');
  }
  
  if(!authorization.startsWith('Bearer ')) {
    throw new UnathorizeError('Invalid Authorization format. Valid : Bearer <token>');
  }

  // Extract the token from authorization
  const token = authorization.split(' ')[1];

  const hashedToken = crypto
                        .createHash('sha256')
                        .update(token)
                        .digest('hex');

  const validToken = await SessionToken.findOne({token : hashedToken}).populate('user');

  if(!validToken) {
    throw new UnathorizeError('Token has Expired or is Invalid.', ERROR_CODES.INVALID_TOKEN);
  }

  req.user = validToken.user;
  req.token = validToken;
  next();
}

module.exports = verifySessionToken;
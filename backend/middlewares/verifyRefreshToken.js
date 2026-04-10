const jwt = require('jsonwebtoken');
const GenericError = require('../errors/GenericError');
const ERROR_CODES = require('../constants/errorCodes');

const verifyRefreshToken = (req, res, next) => {
  const refreshToken = req.cookies.gtrt;
  
  if (!refreshToken) {
    throw new GenericError(400, 'No active session found.', ERROR_CODES.INVALID_SESSION);
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESHTOKEN, (err, decoded) => {
    if(err) {
      throw new GenericError(400, 'Invalid Refresh Token.', ERROR_CODES.INVALID_TOKEN)
    }

    return decoded;
  }); 
  
  req.refreshToken = refreshToken;
  req.user = decoded;
  next();
};

module.exports = verifyRefreshToken;
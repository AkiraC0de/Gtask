const UnathorizeError = require("../errors/UnuthorizeError");

const verifyAdmin = (req, res, next) => {
  if(req.user.role != 'admin'){
    throw new UnathorizeError('You are not allowed to access this route.');
  }

  next();
}

module.exports = verifyAdmin;
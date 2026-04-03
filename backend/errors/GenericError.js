const ERROR_CODES = require('../errors/errorCodes');

class GenericError extends Error {
  constructor(status, message, code) {
      super(message);
      this.name = this.constructor.name;
      this.status = status;
      this.code = code 
      Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
      return {
          success: false,
          code: this.code || ERROR_CODES.UNKOWN_ERROR,  
          message: this.message
      };
  }
}

module.exports = GenericError;
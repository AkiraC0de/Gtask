const GenericError = require('./GenericError');
const ERROR_CODES = require('../constants/errorCodes');

class UnathorizeError extends GenericError {
  constructor(message, code = ERROR_CODES.UNUTHORIZE_ERROR) {
    super(
      401,
      message,
      code,
    );
  }

  toJSON() {
      return {
          success: false,
          code: this.code,  
          message: this.message
      };
  }
}

module.exports = UnathorizeError;
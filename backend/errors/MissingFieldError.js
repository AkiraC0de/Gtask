const GenericError = require('./GenericError');
const ERROR_CODES = require('../errors/errorCodes');

class MissingFieldError extends GenericError {
  constructor(message, errors) {
    super(
      400,
      message,
      ERROR_CODES.MISSING_FIELD,
    );
    this.errors = errors 
  }

  toJSON() {
      return {
          success: false,
          code: this.code,  
          errors : this.errors,
          message: this.message
      };
  }
}

module.exports = MissingFieldError;
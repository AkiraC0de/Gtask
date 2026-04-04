const GenericError = require('./GenericError');
const ERROR_CODES = require('./errorCodes');

class ValidationError extends GenericError {
  constructor(message, errors){
    super(
      400,
      message,
      ERROR_CODES.VALIDATION_ERROR
    )

    this.errors = errors;
  }

  toJSON = () => {
    return {
        success: false,
        code: this.code || ERROR_CODES.UNKOWN_ERROR,  
        message: this.message,
        errros: this.errors
    };
  }
}

module.exports = ValidationError;
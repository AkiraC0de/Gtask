class ResponseError extends Error {
  constructor(status, message, field = null) {
      super(message);
      this.name = this.constructor.name;
      this.status = status;
      this.field = field;
      Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
      return {
          success: false,
          field: this.field || 'server',
          message: this.message
      };
  }
}

module.exports = ResponseError;
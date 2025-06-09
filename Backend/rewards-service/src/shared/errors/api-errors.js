//shared/errors/api-errors.js
class ApiError extends Error {
    constructor(statusCode, message, errorCode) {
      super(message);
      this.statusCode = statusCode;
      this.errorCode = errorCode;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = {
    ApiError,
    BadRequestError: class extends ApiError {
      constructor(message = 'Bad Request', errorCode = 'BAD_REQUEST') {
        super(400, message, errorCode);
      }
    },
    NotFoundError: class extends ApiError {
      constructor(message = 'Not Found', errorCode = 'NOT_FOUND') {
        super(404, message, errorCode);
      }
    },
    InternalServerError: class extends ApiError {
      constructor(message = 'Internal Server Error', errorCode = 'INTERNAL_ERROR') {
        super(500, message, errorCode);
      }
    }
  };
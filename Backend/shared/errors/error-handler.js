//shared/errors/error-handler.js// shared/errors/error-handler.js
const { ApiError } = require('./api-errors');

module.exports = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error: ${err.message}`);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Handle MongoDB errors
  if (err.name === 'MongoError') {
    return res.status(500).json({
      success: false,
      message: 'Database error',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack
    })
  });
};



// // shared/errors/error-handler.js
// class APIError extends Error {
//   constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
//     super(message);
//     this.statusCode = statusCode;
//     this.code = code;
//     this.isOperational = isOperational;
//     this.timestamp = new Date().toISOString();
    
//     Error.captureStackTrace(this, this.constructor);
//   }
// }

// class ValidationError extends APIError {
//   constructor(message, errors = []) {
//     super(message, 400, 'VALIDATION_ERROR');
//     this.errors = errors;
//   }
// }

// class AuthenticationError extends APIError {
//   constructor(message = 'Authentication required') {
//     super(message, 401, 'AUTHENTICATION_ERROR');
//   }
// }

// class AuthorizationError extends APIError {
//   constructor(message = 'Insufficient permissions') {
//     super(message, 403, 'AUTHORIZATION_ERROR');
//   }
// }

// class NotFoundError extends APIError {
//   constructor(message = 'Resource not found') {
//     super(message, 404, 'NOT_FOUND_ERROR');
//   }
// }

// class ConflictError extends APIError {
//   constructor(message = 'Resource conflict') {
//     super(message, 409, 'CONFLICT_ERROR');
//   }
// }

// class RateLimitError extends APIError {
//   constructor(message = 'Rate limit exceeded') {
//     super(message, 429, 'RATE_LIMIT_ERROR');
//   }
// }

// class ServiceUnavailableError extends APIError {
//   constructor(message = 'Service temporarily unavailable') {
//     super(message, 503, 'SERVICE_UNAVAILABLE_ERROR');
//   }
// }

// // Error handler middleware
// const errorHandler = (error, req, res, next) => {
//   // If response already sent, delegate to Express default error handler
//   if (res.headersSent) {
//     return next(error);
//   }

//   // Log error details
//   const errorLog = {
//     timestamp: new Date().toISOString(),
//     requestId: req.requestId,
//     method: req.method,
//     url: req.url,
//     ip: req.ip,
//     userAgent: req.get('User-Agent'),
//     error: {
//       name: error.name,
//       message: error.message,
//       code: error.code,
//       stack: error.stack
//     }
//   };

//   // Log based on error severity
//   if (error.statusCode && error.statusCode < 500) {
//     console.warn('Client Error:', JSON.stringify(errorLog, null, 2));
//   } else {
//     console.error('Server Error:', JSON.stringify(errorLog, null, 2));
//   }

//   // Handle specific error types
//   if (error instanceof APIError) {
//     return res.status(error.statusCode).json({
//       success: false,
//       message: error.message,
//       code: error.code,
//       timestamp: error.timestamp,
//       requestId: req.requestId,
//       ...(error.errors && { errors: error.errors })
//     });
//   }

//   // Handle Mongoose validation errors
//   if (error.name === 'ValidationError') {
//     const errors = Object.values(error.errors).map(err => ({
//       field: err.path,
//       message: err.message,
//       value: err.value
//     }));
    
//     return res.status(400).json({
//       success: false,
//       message: 'Validation failed',
//       code: 'VALIDATION_ERROR',
//       errors,
//       requestId: req.requestId
//     });
//   }

//   // Handle Mongoose cast errors
//   if (error.name === 'CastError') {
//     return res.status(400).json({
//       success: false,
//       message: `Invalid ${error.path}: ${error.value}`,
//       code: 'INVALID_DATA_FORMAT',
//       requestId: req.requestId
//     });
//   }

//   // Handle MongoDB duplicate key errors
//   if (error.code === 11000) {
//     const field = Object.keys(error.keyValue || {})[0] || 'field';
//     return res.status(409).json({
//       success: false,
//       message: `Duplicate value for ${field}`,
//       code: 'DUPLICATE_KEY_ERROR',
//       field,
//       requestId: req.requestId
//     });
//   }

//   // Handle JWT errors
//   if (error.name === 'JsonWebTokenError') {
//     return res.status(401).json({
//       success: false,
//       message: 'Invalid authentication token',
//       code: 'INVALID_TOKEN',
//       requestId: req.requestId
//     });
//   }

//   if (error.name === 'TokenExpiredError') {
//     return res.status(401).json({
//       success: false,
//       message: 'Authentication token expired',
//       code: 'TOKEN_EXPIRED',
//       requestId: req.requestId
//     });
//   }

//   // Handle MongoDB connection errors
//   if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
//     return res.status(503).json({
//       success: false,
//       message: 'Database connection error',
//       code: 'DATABASE_ERROR',
//       requestId: req.requestId
//     });
//   }

//   // Handle request timeout
//   if (error.code === 'REQUEST_TIMEOUT') {
//     return res.status(408).json({
//       success: false,
//       message: 'Request timeout',
//       code: 'REQUEST_TIMEOUT',
//       requestId: req.requestId
//     });
//   }

//   // Handle multer errors (file upload)
//   if (error.code === 'LIMIT_FILE_SIZE') {
//     return res.status(413).json({
//       success: false,
//       message: 'File too large',
//       code: 'FILE_TOO_LARGE',
//       requestId: req.requestId
//     });
//   }

//   if (error.code === 'LIMIT_FILE_COUNT') {
//     return res.status(400).json({
//       success: false,
//       message: 'Too many files uploaded',
//       code: 'TOO_MANY_FILES',
//       requestId: req.requestId
//     });
//   }

//   // Default error response for unknown errors
//   const statusCode = error.statusCode || error.status || 500;
//   const isDevelopment = process.env.NODE_ENV === 'development';
  
//   res.status(statusCode).json({
//     success: false,
//     message: isDevelopment ? error.message : 'Internal server error',
//     code: error.code || 'INTERNAL_ERROR',
//     requestId: req.requestId,
//     ...(isDevelopment && { stack: error.stack })
//   });
// };

// // 404 Not Found handler
// const notFoundHandler = (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Cannot ${req.method} ${req.path}`,
//     code: 'ROUTE_NOT_FOUND',
//     requestId: req.requestId,
//     availableEndpoints: {
//       health: 'GET /health',
//       ready: 'GET /ready',
//       live: 'GET /live',
//       api: 'GET /api',
//       submissions: 'POST /api/submissions/:serviceType',
//       balance: 'GET /api/balance',
//       admin: 'GET /api/admin'
//     }
//   });
// };

// // Async error wrapper
// const asyncHandler = (fn) => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

// // Error response helper
// const sendErrorResponse = (res, error, requestId = null) => {
//   const statusCode = error.statusCode || 500;
//   const response = {
//     success: false,
//     message: error.message,
//     code: error.code || 'INTERNAL_ERROR',
//     timestamp: new Date().toISOString(),
//     ...(requestId && { requestId })
//   };

//   if (error.errors) {
//     response.errors = error.errors;
//   }

//   if (process.env.NODE_ENV === 'development' && error.stack) {
//     response.stack = error.stack;
//   }

//   res.status(statusCode).json(response);
// };

// module.exports = {
//   APIError,
//   ValidationError,
//   AuthenticationError,
//   AuthorizationError,
//   NotFoundError,
//   ConflictError,
//   RateLimitError,
//   ServiceUnavailableError,
//   errorHandler,
//   notFoundHandler,
//   asyncHandler,
//   sendErrorResponse
// };
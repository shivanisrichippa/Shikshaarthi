const { body, validationResult } = require('express-validator');

// Middleware for validating email
exports.validateCheckEmail = [
  body('email')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        })),
        errorCode: 'VALIDATION_ERROR'
      });
    }
    next();
  }
];
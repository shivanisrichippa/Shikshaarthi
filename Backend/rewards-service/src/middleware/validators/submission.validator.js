

//rewards-service/src/middleware/validators/submission.validator.js

const { body, query, param, validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');
const logger = require('../../config/logger');

const SERVICE_TYPES = ['mess', 'rental', 'plumber', 'electrician', 'laundry', 'medical'];

/**
 * Middleware to handle the result of express-validator validations.
 * If there are errors, it sends a 400 Bad Request response.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`[ValidationMiddleware] Validation errors for ${req.method} ${req.originalUrl}:`, {
      errors: errors.array().slice(0, 5), // Log first 5 errors for brevity
    });
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Validation failed. Please check your input.",
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validation rules for a new data submission from a user.
 * It includes common field checks and service-specific validations.
 */
const submissionRules = () => [
  body('serviceType').trim().notEmpty().withMessage('Service type is required.').isIn(SERVICE_TYPES).withMessage(`Invalid serviceType. Must be one of: ${SERVICE_TYPES.join(', ')}`),
  body('data').exists().withMessage('Form data object ("data" field) is required.').notEmpty().withMessage('Form data object ("data" field) cannot be empty.').isObject().withMessage('Form data ("data" field) must be an object.'),

  // Common Fields Validation
  body('data.name').exists({ checkFalsy: true }).withMessage('Name or Title is required.').isString().trim().isLength({ min: 3, max: 150 }),
  body('data.address').exists({ checkFalsy: true }).withMessage('Address is required.').isString().trim().isLength({ min: 10, max: 300 }),
  body('data.district').exists({ checkFalsy: true }).withMessage('District is required.').isString().trim().isLength({ min: 2, max: 100 }),
  body('data.state').exists({ checkFalsy: true }).withMessage('State is required.').isString().trim().isLength({ min: 2, max: 100 }),
  body('data.pincode').exists({ checkFalsy: true }).withMessage('Pincode is required.').isString().trim().isPostalCode('IN').withMessage('Invalid 6-digit Indian postal code.'),
  body('data.mobile').exists({ checkFalsy: true }).withMessage('A contact mobile number is required.').isString().trim().matches(/^[6-9]\d{9}$/).withMessage('Invalid 10-digit Indian mobile number.'),
  body('data.email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email format.').normalizeEmail(),

  // --- SERVICE-SPECIFIC VALIDATIONS ---
  // Mess Service
  body('data.description').if((v, { req }) => req.body.serviceType === 'mess').exists({ checkFalsy: true }).withMessage('Description is required for Mess.').isString().trim().isLength({ min: 10, max: 500 }),
  body('data.price').if((v, { req }) => req.body.serviceType === 'mess').exists({ checkFalsy: true }).withMessage('Price is required for Mess.').isString().trim().isLength({ min: 1, max: 70 }),
  body('data.messType').if((v, { req }) => req.body.serviceType === 'mess').exists({ checkFalsy: true }).withMessage('Mess type is required.').isIn(['Pure Veg', 'Pure Non-Veg', 'Both Veg and Non-Veg']),
  body('data.holderName').if((v, { req }) => req.body.serviceType === 'mess').exists({ checkFalsy: true }).withMessage('Owner name is required for Mess.').isString().isLength({ min: 2, max: 100 }),

  // Rental Service
  body('data.type').if((v, { req }) => req.body.serviceType === 'rental').exists({ checkFalsy: true }).withMessage('Property type is required.').isString().isIn(['PG', 'Hostel', 'Apartment', 'Shared Room', 'House', 'Flat', '1BHK', '2BHK', '1RK', 'Single Room']),
  body('data.holderName').if((v, { req }) => req.body.serviceType === 'rental').exists({ checkFalsy: true }).withMessage('Owner name is required for Rental.').isString().isLength({ min: 2, max: 100 }),

  // Electrician & Plumber
  body('data.experience').if((v, { req }) => ['electrician', 'plumber'].includes(req.body.serviceType)).exists({ checkFalsy: true }).withMessage('Experience is required.').isString().trim().isLength({ min: 1, max: 50 }),
  body('data.aadharNumber').if((v, { req }) => ['electrician', 'plumber'].includes(req.body.serviceType)).exists({ checkFalsy: true }).withMessage('Aadhaar Number is required.').isString().trim().isLength({ is: 12 }).withMessage('Aadhaar must be 12 digits.').isNumeric(),

  // Medical Service
  body('data.type').if((v, { req }) => req.body.serviceType === 'medical').exists({ checkFalsy: true }).withMessage('Facility type is required.').isString().isIn(['Medical Shop', 'Hospital', 'Clinic', 'Diagnostic Center', 'Doctor', 'Other']),
];

/**
 * Validation rules for querying submissions (used by both user and admin).
 */
const getSubmissionsRules = () => [
  query('status').optional().trim().isIn(['pending', 'verified', 'rejected', 'all']).withMessage('Invalid status filter.'),
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt().withMessage('Limit must be between 1 and 50.'),
  query('serviceType').optional().trim().isIn(SERVICE_TYPES).withMessage('Invalid serviceType filter.'),
];

/**
 * Validation rule for checking if a route parameter is a valid MongoDB ObjectId.
 */
const submissionIdParamRule = () => [
  param('submissionId').isMongoId().withMessage('Invalid submission ID format.'),
];

/**
 * Validation rules for when an admin updates a submission's data.
 * This checks that the body is an object and specific fields are of the correct type if they exist.
 */
const updateSubmissionRules = () => [
    body().isObject().withMessage('Request body must be an object containing the fields to update.'),
    body('name').optional().isString().trim().isLength({ min: 3 }),
    body('address').optional().isString().trim().isLength({ min: 10 }),
    body('pincode').optional().isString().trim().isPostalCode('IN'),
    body('mobile').optional().isString().trim().matches(/^[6-9]\d{9}$/),
    // Add any other fields you allow admins to edit here
];

/**
 * Validation rules for the approve action.
 */
const approveSubmissionRules = () => [
  body('adminNotes').optional({ checkFalsy: true }).isString().trim().isLength({ max: 500 }).withMessage('Approval notes cannot exceed 500 characters.'),
];

// /**
//  * Validation rules for the reject action.
//  */
// const rejectSubmissionRules = () => [
//   body('reason').exists({ checkFalsy: true }).withMessage('Rejection reason is required.')
//     .isString().trim().isLength({ min: 10, max: 500 }).withMessage('Rejection reason must be between 10 and 500 characters.'),
// ];

/**
 * A more generic (and now legacy) rule set for processing submissions.
 * It's better to use the more specific approve/reject rules.
 */
const adminActionRules = () => [
  param('submissionId').isMongoId().withMessage('Invalid submission ID format.'),
  body('action').isIn(['verify', 'reject']).withMessage('Action must be "verify" or "reject".'),
  body('adminNotes').optional({checkFalsy: true}).isString().trim().isLength({ max: 1000 }).withMessage('Admin notes too long.'),
  body('rejectionReason')
    .if(body('action').equals('reject'))
    .exists({ checkFalsy: true }).withMessage('Rejection reason is required when rejecting.')
    .isString().trim().isLength({ min: 5, max: 500 }).withMessage('Rejection reason must be between 5 and 500 characters.'),
];


const rejectSubmissionRules = () => [
  // CORRECTED from 'reason' to 'adminNotes' to match controller and frontend
  body('adminNotes').exists({ checkFalsy: true }).withMessage('Rejection reason (in adminNotes) is required.')
    .isString().trim().isLength({ min: 10, max: 500 }).withMessage('Rejection reason must be between 10 and 500 characters.'),
];
module.exports = {
  // Export all functions so they can be imported in other files
  handleValidationErrors,
  submissionRules,
  getSubmissionsRules,
  submissionIdParamRule,
  updateSubmissionRules,
  approveSubmissionRules,
  rejectSubmissionRules,
  adminActionRules, // Keep for backward compatibility if needed
  SERVICE_TYPES,
  
};
// rewards-service/src/middleware/validation.middleware.js
const Joi = require('joi');
const multer = require('multer');
const path = require('path');

class ValidationMiddleware {
  constructor() {
    // Configure multer for image uploads
    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 6 // Maximum 6 files
      },
      fileFilter: this.fileFilter.bind(this)
    });
  }

  // File filter for images
  fileFilter(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
    }
  }

  // Handle multer upload with error handling
  handleImageUpload(fieldName = 'images', maxFiles = 6) {
    return (req, res, next) => {
      const uploadHandler = this.upload.array(fieldName, maxFiles);
      
      uploadHandler(req, res, (error) => {
        if (error) {
          if (error instanceof multer.MulterError) {
            return this.handleMulterError(error, res);
          } else {
            return res.status(400).json({
              success: false,
              message: error.message,
              code: 'FILE_UPLOAD_ERROR'
            });
          }
        }

        // Validate uploaded files
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'At least one image is required',
            code: 'IMAGES_REQUIRED'
          });
        }

        if (req.files.length < 2) {
          return res.status(400).json({
            success: false,
            message: 'Minimum 2 images are required for verification',
            code: 'INSUFFICIENT_IMAGES'
          });
        }

        // Add file metadata
        req.files.forEach((file, index) => {
          file.uploadId = `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 8)}`;
        });

        next();
      });
    };
  }

  // Handle multer errors
  handleMulterError(error, res) {
    let message = 'File upload error';
    let code = 'UPLOAD_ERROR';

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size too large. Maximum 5MB per image.';
        code = 'FILE_TOO_LARGE';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum 6 images allowed.';
        code = 'TOO_MANY_FILES';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field name for file upload.';
        code = 'UNEXPECTED_FIELD';
        break;
      default:
        message = error.message;
    }

    return res.status(400).json({
      success: false,
      message,
      code
    });
  }

  // Generic validation middleware
  validate(schema, source = 'body') {
    return (req, res, next) => {
      const dataToValidate = req[source];
      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors
        });
      }

      // Replace the original data with validated data
      req[source] = value;
      next();
    };
  }

  // Service-specific validation schemas
  getServiceValidationSchema(serviceType) {
    const baseSchema = {
      data: Joi.object().required(),
      location: Joi.object({
        address: Joi.string().min(10).max(200),
        city: Joi.string().min(2).max(50),
        state: Joi.string().min(2).max(50),
        pincode: Joi.string().pattern(/^\d{6}$/),
        coordinates: Joi.object({
          latitude: Joi.number().min(-90).max(90),
          longitude: Joi.number().min(-180).max(180)
        })
      })
    };

    const serviceSchemas = {
      rental: {
        ...baseSchema,
        data: Joi.object({
          name: Joi.string().min(3).max(100).required()
            .messages({
              'string.min': 'Property name must be at least 3 characters',
              'string.max': 'Property name cannot exceed 100 characters'
            }),
          address: Joi.string().min(10).max(200).required()
            .messages({
              'string.min': 'Address must be at least 10 characters',
              'string.max': 'Address cannot exceed 200 characters'
            }),
          rent: Joi.number().min(1000).max(100000).required()
            .messages({
              'number.min': 'Rent must be at least ₹1000',
              'number.max': 'Rent cannot exceed ₹100000'
            }),
          contact: Joi.string().pattern(/^[6-9]\d{9}$/).required()
            .messages({
              'string.pattern.base': 'Please provide a valid 10-digit mobile number'
            }),
          roomType: Joi.string().valid('single', 'shared', 'pg', 'hostel', 'apartment').required(),
          facilities: Joi.array().items(Joi.string().max(50)).max(10),
          ownerName: Joi.string().min(2).max(50),
          securityDeposit: Joi.number().min(0).max(50000),
          availableFrom: Joi.date().min('now'),
          nearbyLandmarks: Joi.string().max(200),
          additionalCharges: Joi.string().max(100)
        }).required()
      },

      mess: {
        ...baseSchema,
        data: Joi.object({
          name: Joi.string().min(3).max(100).required(),
          address: Joi.string().min(10).max(200).required(),
          pricePerMeal: Joi.number().min(20).max(500).required()
            .messages({
              'number.min': 'Price per meal must be at least ₹20',
              'number.max': 'Price per meal cannot exceed ₹500'
            }),
          contact: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
          mealTypes: Joi.array().items(
            Joi.string().valid('breakfast', 'lunch', 'dinner', 'snacks')
          ).min(1).required(),
          timing: Joi.object({
            breakfast: Joi.string().max(20),
            lunch: Joi.string().max(20),
            dinner: Joi.string().max(20)
          }),
          menuDescription: Joi.string().max(300),
          ownerName: Joi.string().min(2).max(50),
          monthlyPackage: Joi.number().min(1000).max(15000),
          trialAvailable: Joi.boolean()
        }).required()
      },

      medical: {
        ...baseSchema,
        data: Joi.object({
          name: Joi.string().min(3).max(100).required(),
          address: Joi.string().min(10).max(200).required(),
          services: Joi.array().items(Joi.string().max(50)).min(1).max(15).required(),
          contact: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
          specialization: Joi.string().min(3).max(100).required(),
          doctorName: Joi.string().min(2).max(50),
          timing: Joi.string().max(100),
          consultationFee: Joi.number().min(50).max(2000),
          emergencyAvailable: Joi.boolean(),
          insuranceAccepted: Joi.array().items(Joi.string().max(50)).max(10)
        }).required()
      },

      plumber: {
        ...baseSchema,
        data: Joi.object({
          name: Joi.string().min(2).max(50).required(),
          contact: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
          services: Joi.array().items(Joi.string().max(50)).min(1).max(10).required(),
          experience: Joi.number().min(0).max(50).required(),
          rates: Joi.string().min(10).max(100).required(),
          availability: Joi.string().max(100),
          emergencyService: Joi.boolean(),
          workingAreas: Joi.array().items(Joi.string().max(50)).max(10)
        }).required()
      },

      electrician: {
        ...baseSchema,
        data: Joi.object({
          name: Joi.string().min(2).max(50).required(),
          contact: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
          services: Joi.array().items(Joi.string().max(50)).min(1).max(10).required(),
          experience: Joi.number().min(0).max(50).required(),
          rates: Joi.string().min(10).max(100).required(),
          availability: Joi.string().max(100),
          emergencyService: Joi.boolean(),
          workingAreas: Joi.array().items(Joi.string().max(50)).max(10),
          certifications: Joi.array().items(Joi.string().max(50)).max(5)
        }).required()
      },

      laundry: {
        ...baseSchema,
        data: Joi.object({
          name: Joi.string().min(3).max(100).required(),
          address: Joi.string().min(10).max(200).required(),
          services: Joi.array().items(Joi.string().max(50)).min(1).max(10).required(),
          contact: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
          pricing: Joi.string().min(10).max(200).required(),
          pickupDelivery: Joi.boolean(),
          timing: Joi.string().max(100),
          expressService: Joi.boolean(),
          priceList: Joi.object()
        }).required()
      }
    };

    return serviceSchemas[serviceType] || baseSchema;
  }

  // Validate service submission
  validateServiceSubmission(serviceType) {
    const schema = this.getServiceValidationSchema(serviceType);
    return this.validate(Joi.object(schema));
  }

  // Query parameter validation
  validateQueryParams(schema) {
    return this.validate(schema, 'query');
  }

  // Path parameter validation
  validatePathParams(schema) {
    return this.validate(schema, 'params');
  }

  // Common query schemas
  getPaginationSchema() {
    return Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sortBy: Joi.string().valid('createdAt', 'updatedAt', 'status', 'priority').default('createdAt'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    });
  }

  getFilterSchema() {
    return Joi.object({
      status: Joi.string().valid('pending', 'under_review', 'verified', 'rejected', 'all'),
      serviceType: Joi.string().valid('rental', 'mess', 'medical', 'plumber', 'electrician', 'laundry'),
      priority: Joi.string().valid('low', 'medium', 'high', 'urgent', 'all'),
      startDate: Joi.date(),
      endDate: Joi.date().min(Joi.ref('startDate'))
    });
  }

  // Admin action validation
  validateAdminAction() {
    return this.validate(
      Joi.object({
        action: Joi.string().valid('verify', 'reject').required(),
        notes: Joi.string().max(500),
        rejectionReason: Joi.string().max(200).when('action', {
          is: 'reject',
          then: Joi.required(),
          otherwise: Joi.forbidden()
        }),
        coinsAwarded: Joi.number().min(0).max(100).when('action', {
          is: 'verify',
          then: Joi.optional(),
          otherwise: Joi.forbidden()
        })
      })
    );
  }

  // Sanitize input data
  sanitizeInput() {
    return (req, res, next) => {
      if (req.body) {
        req.body = this.deepSanitize(req.body);
      }
      if (req.query) {
        req.query = this.deepSanitize(req.query);
      }
      if (req.params) {
        req.params = this.deepSanitize(req.params);
      }
      next();
    };
  }

  // Deep sanitize object
  deepSanitize(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return typeof obj === 'string' ? this.sanitizeString(obj) : obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepSanitize(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = this.sanitizeString(key);
      sanitized[sanitizedKey] = this.deepSanitize(value);
    }

    return sanitized;
  }

  // Sanitize string
  sanitizeString(str) {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Rate limiting for submissions
  createSubmissionRateLimit() {
    const submissions = new Map();
    const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
    const MAX_SUBMISSIONS = 3; // 3 submissions per minute

    return (req, res, next) => {
      if (!req.user) {
        return next();
      }

      const userId = req.user.id;
      const now = Date.now();
      
      if (!submissions.has(userId)) {
        submissions.set(userId, []);
      }

      const userSubmissions = submissions.get(userId);
      
      // Remove old submissions outside the window
      const recentSubmissions = userSubmissions.filter(
        timestamp => now - timestamp < RATE_LIMIT_WINDOW
      );
      
      if (recentSubmissions.length >= MAX_SUBMISSIONS) {
        return res.status(429).json({
          success: false,
          message: 'Too many submissions. Please wait before submitting again.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - recentSubmissions[0])) / 1000)
        });
      }

      recentSubmissions.push(now);
      submissions.set(userId, recentSubmissions);

      // Clean up old entries periodically
      if (submissions.size > 1000) {
        this.cleanupRateLimit(submissions, now, RATE_LIMIT_WINDOW);
      }

      next();
    };
  }

  // Cleanup rate limit map
  cleanupRateLimit(submissions, now, window) {
    for (const [userId, timestamps] of submissions.entries()) {
      const recentTimestamps = timestamps.filter(
        timestamp => now - timestamp < window
      );
      
      if (recentTimestamps.length === 0) {
        submissions.delete(userId);
      } else {
        submissions.set(userId, recentTimestamps);
      }
    }
  }

  // Validate service type middleware
  validateServiceType() {
    const validServiceTypes = ['rental', 'mess', 'medical', 'plumber', 'electrician', 'laundry'];
    
    return (req, res, next) => {
      const serviceType = req.params.serviceType || req.body.serviceType || req.query.serviceType;
      
      if (!serviceType) {
        return res.status(400).json({
          success: false,
          message: 'Service type is required',
          code: 'SERVICE_TYPE_REQUIRED'
        });
      }

      if (!validServiceTypes.includes(serviceType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid service type. Valid types: ${validServiceTypes.join(', ')}`,
          code: 'INVALID_SERVICE_TYPE'
        });
      }

      req.serviceType = serviceType;
      next();
    };
  }

  // Content-Type validation
  validateContentType(expectedType = 'application/json') {
    return (req, res, next) => {
      if (req.method === 'GET' || req.method === 'DELETE') {
        return next();
      }

      const contentType = req.get('Content-Type');
      
      if (!contentType) {
        return res.status(400).json({
          success: false,
          message: 'Content-Type header is required',
          code: 'CONTENT_TYPE_REQUIRED'
        });
      }

      if (expectedType === 'multipart/form-data') {
        if (!contentType.startsWith('multipart/form-data')) {
          return res.status(400).json({
            success: false,
            message: 'Content-Type must be multipart/form-data for file uploads',
            code: 'INVALID_CONTENT_TYPE'
          });
        }
      } else if (!contentType.includes(expectedType)) {
        return res.status(400).json({
          success: false,
          message: `Content-Type must be ${expectedType}`,
          code: 'INVALID_CONTENT_TYPE'
        });
      }

      next();
    };
  }

  // Request size validation
  validateRequestSize(maxSize = '10mb') {
    return (req, res, next) => {
      const contentLength = parseInt(req.get('Content-Length') || '0');
      const maxSizeBytes = this.parseSize(maxSize);

      if (contentLength > maxSizeBytes) {
        return res.status(413).json({
          success: false,
          message: `Request size too large. Maximum allowed: ${maxSize}`,
          code: 'REQUEST_TOO_LARGE'
        });
      }

      next();
    };
  }

  // Parse size string to bytes
  parseSize(sizeStr) {
    const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
    const match = sizeStr.toLowerCase().match(/^(\d+)(b|kb|mb|gb)$/);
    
    if (!match) return 0;
    
    return parseInt(match[1]) * units[match[2]];
  }

  // Validate submission ID format
  validateSubmissionId() {
    return (req, res, next) => {
      const submissionId = req.params.submissionId || req.params.id;
      
      if (!submissionId) {
        return res.status(400).json({
          success: false,
          message: 'Submission ID is required',
          code: 'SUBMISSION_ID_REQUIRED'
        });
      }

      // Check if it's a valid MongoDB ObjectId or custom submission ID
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      const customIdRegex = /^SUB-\d{8}-[A-Z0-9]{6}$/;

      if (!objectIdRegex.test(submissionId) && !customIdRegex.test(submissionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid submission ID format',
          code: 'INVALID_SUBMISSION_ID'
        });
      }

      next();
    };
  }

  // Health check middleware
  healthCheck() {
    return (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Validation middleware is healthy',
        data: {
          status: 'operational',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage()
        }
      });
    };
  }
}

// Export singleton instance
module.exports = new ValidationMiddleware();
// backend/rewards-service/src/routes/submission.routes.js
const express = require('express');
const submissionController = require('../controllers/submission.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { 
    submissionRules, 
    getSubmissionsRules, 
    submissionIdParamRule, 
    handleValidationErrors 
} = require('../middleware/validators/submission.validator');
const multer = require('multer');
const parseDataField = require('../middleware/parseDataField'); // IMPORT

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'), false);
    }
  },
});

router.post(
  '/',
  authenticateToken,
  upload.array('images', 6), // Multer first: populates req.files and req.body (with string 'data')
  parseDataField,             // Then parseDataField: converts req.body.data from string to object
  submissionRules(),          // Then submissionRules: validates req.body.serviceType and req.body.data (which is now an object)
  handleValidationErrors,     // Then handleValidationErrors: checks results of submissionRules
  submissionController.submitData // Finally, the controller
);

router.get(
  '/me',
  authenticateToken,
  getSubmissionsRules(),
  handleValidationErrors,
  submissionController.getUserSubmissions
);

router.get(
  '/:submissionId',
  authenticateToken,
  submissionIdParamRule(),
  handleValidationErrors,
  submissionController.getSubmissionDetails
);

module.exports = router;
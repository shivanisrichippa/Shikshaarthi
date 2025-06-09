const express = require('express');
const balanceController = require('../controllers/balance.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { getSubmissionsRules, handleValidationErrors } = require('../middleware/validators/submission.validator'); // Re-use for pagination params

const router = express.Router();

// GET /api/rewards/balance/me
router.get(
    '/me',
    authenticateToken,
    getSubmissionsRules(), // For page/limit query params
    handleValidationErrors,
    balanceController.getUserCoinBalanceAndHistory
);

module.exports = router;
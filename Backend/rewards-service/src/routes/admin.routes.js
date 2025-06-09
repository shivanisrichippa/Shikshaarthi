// ========================================================================
// FILE: rewards-service/src/routes/admin.routes.js (CORRECTED)
// ========================================================================

const express = require('express');
const adminController = require('../controllers/admin.controller'); // Make sure this path is correct
const { authenticateToken, authorizeAdmin } = require('../middleware/auth.middleware');
const { 
    getSubmissionsRules, 
    submissionIdParamRule, 
    updateSubmissionRules,
    approveSubmissionRules,
    rejectSubmissionRules,
    handleValidationErrors 
} = require('../middleware/validators/submission.validator');
const notificationRoutes = require('./notification.routes'); // <-- IMPORT NEW ROUTES

const router = express.Router();

router.use(authenticateToken, authorizeAdmin);
router.use('/notifications', notificationRoutes); // <-- ADD THIS LINE

router.get(
    '/submissions',
    getSubmissionsRules(),
    handleValidationErrors,
    adminController.getAdminSubmissions
);

router.get(
    '/submissions/:submissionId',
    submissionIdParamRule(),
    handleValidationErrors,
    adminController.getSubmissionDetails
);

router.put(
    '/submissions/:submissionId',
    submissionIdParamRule(),
    updateSubmissionRules(),
    handleValidationErrors,
    adminController.updateSubmissionData
);

router.patch(
    '/submissions/:submissionId/approve',
    submissionIdParamRule(),
    approveSubmissionRules(),
    handleValidationErrors,
    adminController.approveSubmission
);

router.patch(
    '/submissions/:submissionId/reject',
    submissionIdParamRule(),
    rejectSubmissionRules(),
    handleValidationErrors,
    adminController.rejectSubmission
);

router.get('/users/:userId/transactions', (req, res) => {
    // TODO: Implement the controller logic to fetch coin transactions for a specific user.
    // For now, returning a placeholder.
    console.log(`Admin requested transactions for user: ${req.params.userId}`);
    res.json({
        success: true,
        data: [
             { _id: 'tx1', type: 'submission_reward', amount: 100, description: 'Data submission reward for Mess', transactionDate: new Date(Date.now() - 86400000 * 2).toISOString(), serviceType: 'mess' },
             { _id: 'tx2', type: 'reward_redemption', amount: -50, description: 'Redeemed voucher for Bronze level', transactionDate: new Date(Date.now() - 86400000).toISOString(), serviceType: null },
        ]
    });
});

module.exports = router;
// auth-service/src/controllers/internal.controller.js
const { StatusCodes } = require('http-status-codes');
const User = require('../models/User'); // Ensure path is correct
const logger = require('../config/logger'); // Ensure path is correct



/**
 * @desc   Update a user's submission statistics. Called internally by other services.
 * @route  PUT /internal/users/:userId/submission-stats
 * @access Internal
 */
exports.updateSubmissionStats = async (req, res) => {
    const { userId } = req.params;
    // `action` can be 'submit', 'approve', 'reject'.
    // `change` is +1 for a new action, or -1 if you implement an "undo" feature.
    const { action, change = 1 } = req.body;

    if (!action || !['submit', 'approve', 'reject'].includes(action)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid 'action' provided. Must be 'submit', 'approve', or 'reject'." });
    }

    try {
        const updateQuery = {};
        const numericChange = parseInt(change, 10);

        if (action === 'submit') {
            updateQuery['$inc'] = { 'submissionStats.totalSubmissions': numericChange };
            // Only set the date on the first submission, not on an undo.
            if (numericChange > 0) {
                updateQuery['$set'] = { 'submissionStats.lastSubmissionAt': new Date() };
            }
        } else if (action === 'approve') {
            updateQuery['$inc'] = { 'submissionStats.approvedSubmissions': numericChange };
        } else if (action === 'reject') {
            updateQuery['$inc'] = { 'submissionStats.rejectedSubmissions': numericChange };
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateQuery, { new: true, upsert: false });

        if (!updatedUser) {
            logger.warn(`[Internal Update] User not found for stat update: ${userId}`);
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found.' });
        }

        logger.info(`[Internal Update] Successfully updated submission stats for user ${userId}. Action: ${action}, Change: ${numericChange}`);
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'User submission stats updated successfully.',
            submissionStats: updatedUser.submissionStats
        });

    } catch (error) {
        logger.error(`[Internal Update] Failed to update submission stats for user ${userId}. Error: ${error.message}`, { stack: error.stack });
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error during stat update.' });
    }
};


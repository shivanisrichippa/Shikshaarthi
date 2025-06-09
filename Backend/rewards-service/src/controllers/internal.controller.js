// rewards-service/src/controllers/internal.controller.js
const { StatusCodes } = require('http-status-codes');
const notificationService = require('../services/notification.service');
const logger = require('../config/logger');

const handleRedemptionNotification = async (req, res) => {
    logger.info('[InternalCtrl] Received request to create redemption notification.');
    try {
        // req.body contains { userId, userFullName, userEmail, rewardName, levelId }
        await notificationService.createRedemptionRequestNotification(req.body);
        res.status(StatusCodes.OK).json({ success: true, message: 'Notification created successfully.' });
    } catch (error) {
        logger.error('[InternalCtrl] Failed to create redemption notification:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error while creating notification.' });
    }
};


const handleSpinWinNotification = async (req, res) => {
    logger.info('[InternalCtrl] Received request to create spin win notification.');
    try {
        await notificationService.createSpinWinNotification(req.body);
        res.status(StatusCodes.OK).json({ success: true, message: 'Notification created successfully.' });
    } catch (error) {
        logger.error('[InternalCtrl] Failed to create spin win notification:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error.' });
    }
};

module.exports = {
    handleRedemptionNotification,
    handleSpinWinNotification, // export new handler
};


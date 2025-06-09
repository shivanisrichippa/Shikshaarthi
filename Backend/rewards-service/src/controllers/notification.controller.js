// rewards-service/src/controllers/notification.controller.js

const { StatusCodes } = require('http-status-codes');
const AdminNotificationModelModule = require('../models/AdminNotification.model');
const logger = require('../config/logger');

const getAdminNotifications = async (req, res) => {
    const AdminNotification = AdminNotificationModelModule.getModel();
    if (!AdminNotification) {
        logger.error("[NotificationCtrl] AdminNotification model is not available.");
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: "Service temporarily unavailable due to a database model issue." 
        });
    }

    try {
        // Fetch all notifications, you can add filters like isRead: false later
        const notifications = await AdminNotification.find({})
            .sort({ createdAt: -1 }) // Show newest first
            .limit(50); // Limit to the last 50 notifications for performance

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Notifications fetched successfully.",
            data: notifications,
        });

    } catch (error) {
        logger.error(`[NotificationCtrl] Error fetching admin notifications:`, error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: 'Failed to fetch notifications.' 
        });
    }
};

const markNotificationAsRead = async (req, res) => {
    const { notificationId } = req.params;
    const AdminNotification = AdminNotificationModelModule.getModel();

    try {
        const notification = await AdminNotification.findByIdAndUpdate(
            notificationId,
            { isRead: true, readBy: req.user.userId }, // Assuming JWT payload has userId
            { new: true }
        );

        if (!notification) {
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Notification not found.' });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Notification marked as read.',
            data: notification,
        });

    } catch (error) {
        logger.error(`[NotificationCtrl] Error marking notification as read:`, error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: 'Failed to update notification.' 
        });
    }
};


module.exports = {
    getAdminNotifications,
    markNotificationAsRead,
};
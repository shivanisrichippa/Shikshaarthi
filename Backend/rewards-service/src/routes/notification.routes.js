// rewards-service/src/routes/notification.routes.js

const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// All notification routes are for admins only
router.use(authenticateToken, authorizeAdmin);

// GET /api/rewards/admin/notifications
router.get('/', notificationController.getAdminNotifications);

// PATCH /api/rewards/admin/notifications/:notificationId/read
router.patch('/:notificationId/read', notificationController.markNotificationAsRead);

module.exports = router;
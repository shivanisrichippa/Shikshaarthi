// auth-service/src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');
// Public admin route
router.post('/login', adminController.loginAdmin);

// Protected admin routes (require authentication and admin role)
router.use(authenticateToken, requireAdmin); // Apply middleware to all routes below

// Admin management routes
router.post('/create', adminController.createAdmin);

// User management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserById);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

// User status management routes
router.patch('/users/:userId/toggle-status', adminController.toggleUserStatus);
router.patch('/users/:userId/toggle-verification', adminController.toggleUserVerification);
// --- 🌟 NEW ROUTES FOR REWARDS SERVICE 🌟 ---
// Route to award coins to a user



// New route for sending reward emails
router.post('/send-reward-email', adminController.sendRewardEmail);

// Add this new route for fetching user's coin redemption history
router.get('/users/:userId/redemption-history',  authController.getCoinRedemptionHistory);

module.exports = router;
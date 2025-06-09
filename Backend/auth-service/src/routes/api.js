// auth-service/src/routes/api.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const statsController = require('../controllers/stats.controller');
const { validateCheckEmail } = require('../shared/middleware/request-validation');
const authMiddleware = require('../middleware/auth.middleware');
const adminRoutes = require('./admin.routes'); // Import admin routes
const spinController = require('../controllers/spin.controller');

// Public routes (no authentication required)
router.get('/colleges', authController.getColleges);
router.post('/auth/validate-college', authController.validateCollege);
router.post('/auth/check-email', authController.checkEmail);
router.post('/auth/send-otp', authController.sendVerificationOTP);
router.post('/auth/verify-otp', authController.verifyOTPAndRegister);
router.post('/auth/resend-otp', authController.resendOTP);
router.post('/auth/login', authController.login);

// Password reset flow (public)
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/verify-reset-otp', authController.verifyResetOTP);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/resend-reset-otp', authController.resendResetOTP);

// Logout should be public to work with expired tokens
router.post('/auth/logout', authController.logout);

// Refresh token endpoint (public but validates refresh token internally)
router.post('/auth/refresh-token', authController.refreshToken);
router.post('/auth/verify-token', authController.verifyToken);

// Public stats endpoint
router.get('/stats/platform', statsController.getPlatformStats);

// Admin routes (mount before protected middleware to allow public admin login)
router.use('/admin', adminRoutes);

// Protected routes (require authentication)
router.use(authMiddleware.authenticateToken);

// Authentication-protected routes
router.get('/auth/profile', authController.getProfile);
router.put('/auth/profile', authController.updateProfile);
router.post('/auth/change-password', authController.changePassword);

// User-specific stats (requires authentication)
router.get('/stats/user', statsController.getUserStats);

// Protected routes for coins and levels (add after existing protected routes)
router.put('/auth/update-coins', authController.updateUserCoins);
router.post('/auth/redeem-reward', authController.redeemReward);
router.get('/auth/redeemed-rewards', authController.getRedeemedRewards);


router.get('/spin/status', spinController.getSpins);
router.post('/spin/consume', spinController.consumeSpin);



router.get('/spin/history', spinController.getSpinHistory); // <-- FIX: ADDED THIS ROUTE

module.exports = router;
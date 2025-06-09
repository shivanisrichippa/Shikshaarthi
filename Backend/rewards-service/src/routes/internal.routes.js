// rewards-service/src/routes/internal.routes.js
const express = require('express');
const internalController = require('../controllers/internal.controller');
const internalAuthMiddleware = require('../middleware/internalAuth.middleware');

const router = express.Router();

// Protect all routes in this file with the internal API key
router.use(internalAuthMiddleware);

// Route for auth-service to call when a user redeems a reward
router.post('/notify-redemption', internalController.handleRedemptionNotification);



// --- NEW ROUTE ---
router.post('/notify-spin-win', internalController.handleSpinWinNotification);
module.exports = router;


// rewards-service/src/routes/api.js
const express = require('express');
const submissionRoutes = require('./submission.routes');
const adminRoutes = require('./admin.routes');
const { authenticateUser, authorizeAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Submission endpoints
router.use('/submissions', authenticateUser, submissionRoutes);

// Admin endpoints
router.use('/admin', authenticateUser, authorizeAdmin, adminRoutes);

module.exports = router;
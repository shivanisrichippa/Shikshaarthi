const express = require('express');
const submissionRoutes = require('./submission.routes');
const adminRoutes = require('./admin.routes');
const balanceRoutes = require('./balance.routes');

const router = express.Router();

const API_PREFIX = '/api/rewards';

router.use(`${API_PREFIX}/submissions`, submissionRoutes);
router.use(`${API_PREFIX}/admin`, adminRoutes);
router.use(`${API_PREFIX}/balance`, balanceRoutes);

// Health check
router.get(`${API_PREFIX}/health`, (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Rewards Service' });
});

module.exports = router;
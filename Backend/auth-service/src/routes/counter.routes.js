// auth-service/src/routes/counter.routes.js (NEW FILE)
const express = require('express');
const router = express.Router();
const counterController = require('../controllers/counter.controller');

// GET /api/counters - Get current counter values
router.get('/', counterController.getCounters.bind(counterController));

// POST /api/counters/increment - Increment a specific counter
router.post('/increment', counterController.incrementCounterAPI.bind(counterController));

// POST /api/counters/refresh - Force refresh counters from database
router.post('/refresh', counterController.forceRefresh.bind(counterController));

module.exports = router;
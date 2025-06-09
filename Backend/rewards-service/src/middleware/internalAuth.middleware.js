// rewards-service/src/middleware/internalAuth.middleware.js
const { StatusCodes } = require('http-status-codes');
const config = require('../config');
const logger = require('../config/logger');

const internalAuthMiddleware = (req, res, next) => {
  const providedApiKey = req.headers['x-internal-api-key'];

  if (!config.INTERNAL_API_KEY) {
    logger.error('[InternalAuth] FATAL: INTERNAL_API_KEY is not configured in rewards-service.');
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server misconfiguration.' });
  }

  if (providedApiKey !== config.INTERNAL_API_KEY) {
    logger.warn(`[InternalAuth] Unauthorized internal API call attempt. IP: ${req.ip}.`);
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized internal access.' });
  }
  
  next();
};

module.exports = internalAuthMiddleware;
//auth-service/src/middleware/internalAuth.middleware.js

const { StatusCodes } = require('http-status-codes');
const config = require('../config');
const logger = require('../config/logger');

const internalAuthMiddleware = (req, res, next) => {
  const providedApiKey = req.headers['x-internal-api-key'];

  if (!config.INTERNAL_API_KEY) { 
    logger.error('[InternalAuth] FATAL: INTERNAL_API_KEY is not configured in auth-service. Internal API calls will fail.');
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server misconfiguration for API key.' });
  }

  if (!providedApiKey || providedApiKey !== config.INTERNAL_API_KEY) {
    const expectedKeyPreview = config.INTERNAL_API_KEY ? config.INTERNAL_API_KEY.substring(0, Math.min(5, config.INTERNAL_API_KEY.length)) + '...' : 'NOT_SET';
    const providedKeyPreview = providedApiKey ? providedApiKey.substring(0, Math.min(5, providedApiKey.length)) + '...' : 'MISSING';
    
    logger.warn(`[InternalAuth] Unauthorized internal API call attempt. IP: ${req.ip}. Key used: ${providedKeyPreview}. Expected: ${expectedKeyPreview}`);
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized internal access.' });
  }
  
  logger.debug('[InternalAuth] Internal API key verified successfully.');
  next();
};

module.exports = internalAuthMiddleware;

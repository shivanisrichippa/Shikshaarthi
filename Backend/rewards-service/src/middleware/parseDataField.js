//rewards-service/src/middileware/parseData.js
const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

// This middleware is specifically for multipart/form-data where a 'data' field
// is sent as a JSON string alongside files.
const parseDataField = (req, res, next) => {
  const reqIdForLog = req.user?.userId ? `user-${req.user.userId.slice(-6)}-parse` : `parse-${Date.now()}`;
  
  if (req.body && req.body.data && typeof req.body.data === 'string') {
    try {
      req.body.data = JSON.parse(req.body.data);
      logger.info(`Middleware (parseDataField): Successfully parsed req.body.data (string to object).`);
    } catch (e) {
      logger.warn(`[${reqIdForLog}] [parseDataField] Failed to parse req.body.data as JSON string. Error: ${e.message}`, { dataReceived: req.body.data.substring(0, 100) });
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid format for 'data' field. It must be a valid JSON string when sent with files.",
        errors: [{ param: 'data', msg: 'Must be a valid JSON string if sent as string.', value: req.body.data.substring(0, 100) + '...' }]
      });
    }
  }
  
  next();
};

module.exports = parseDataField;


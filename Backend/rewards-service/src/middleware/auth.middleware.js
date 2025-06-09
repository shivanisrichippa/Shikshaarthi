
// ========================================================================
// FILE: rewards-service/src/middleware/auth.middleware.js
// ========================================================================

const jwt = require('jsonwebtoken');
const config = require('../config'); // Your rewards-service config
const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger'); // Your rewards-service logger

const CORRECT_AUDIENCE = 'Shikshaarthi-users';
const CORRECT_ISSUER = 'Shikshaarthi';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('[RewardsService-AuthMiddleware] Access token is missing or malformed Bearer token.');
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Access token is missing', code: 'NO_TOKEN' });
  }

  if (!config.JWT_SECRET) {
    logger.error("FATAL: JWT_SECRET not configured in rewards-service. Cannot verify tokens.");
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Token verification misconfiguration.", code: 'JWT_SECRET_MISSING' });
  }

  try {
    const decodedUnverified = jwt.decode(token, { complete: true });
    if (decodedUnverified && decodedUnverified.payload) {
      logger.debug('[RewardsService-AuthMiddleware] Decoded token (pre-verification):', {
        header: decodedUnverified.header,
        payload: {
          iss: decodedUnverified.payload.iss,
          aud: decodedUnverified.payload.aud,
          type: decodedUnverified.payload.type,
          userId: decodedUnverified.payload.userId,
          exp: decodedUnverified.payload.exp,
          iat: decodedUnverified.payload.iat
        }
      });
      if (decodedUnverified.payload.type === 'refresh') {
        logger.warn('[RewardsService-AuthMiddleware] Attempt to use refresh token as access token.');
        return res.status(StatusCodes.FORBIDDEN).json({
          message: 'Invalid token type. Access token required, but refresh token provided.',
          code: 'REFRESH_TOKEN_AS_ACCESS'
        });
      }
    }
  } catch (decodeError) {
    // Let jwt.verify handle malformed token errors more specifically
  }

  jwt.verify(token, config.JWT_SECRET, {
    audience: CORRECT_AUDIENCE,
    issuer: CORRECT_ISSUER,
    algorithms: ['HS256']
  }, (err, user) => {
    if (err) {
      logger.warn('[RewardsService-AuthMiddleware] JWT Verification Error:', {
        name: err.name,
        message: err.message,
      });

      if (err.name === 'TokenExpiredError') {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: 'Access token expired. Please log in again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: `Invalid token: ${err.message}.`,
          code: 'INVALID_TOKEN'
        });
      }
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Invalid access token. Authentication failed.',
        code: 'INVALID_TOKEN_GENERAL'
      });
    }

    if (user.type !== 'access') {
      logger.warn('[RewardsService-AuthMiddleware] Verified token is not an access token type.', { type: user.type, userId: user.userId });
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Invalid token type. Access token required.',
        code: 'WRONG_TOKEN_TYPE_POST_VERIFICATION'
      });
    }

    req.user = user;
    logger.debug(`[RewardsService-AuthMiddleware] Token verified successfully for user: ${user.userId}, role: ${user.role}`);
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    logger.warn(`[RewardsService-AuthMiddleware] Admin authorization failed for user: ${req.user?.userId}, role: ${req.user?.role}. Path: ${req.originalUrl}`);
    return res.status(StatusCodes.FORBIDDEN).json({
      message: 'Access denied. Admin privileges required for this action.',
      code: 'INSUFFICIENT_PRIVILEGES'
    });
  }
  logger.debug(`[RewardsService-AuthMiddleware] Admin user ${req.user.userId} authorized for ${req.originalUrl}`);
  next();
};

module.exports = {
  authenticateToken,
  authorizeAdmin,
};

// middleware/auth.middleware.js
const TokenService = require('../services/token.service');

// Authentication middleware for protected routes
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Access denied',
        message: 'Authorization header is required'
      });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
        message: 'Token must be in Bearer format'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied',
        message: 'Token is required'
      });
    }
    
    // Verify token
    const decoded = TokenService.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Token verification failed'
      });
    }
    
    // Add user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      tokenType: decoded.type
    };
    
    req.token = token;
    
    console.log(`Authenticated request for user: ${decoded.email}`);
    next();
    
  } catch (error) {
    console.error('Authentication middleware error:', error);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Token is malformed or invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Token has expired. Please refresh your token or login again.'
      });
    }
    
    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        success: false,
        error: 'Token not active',
        message: 'Token is not active yet'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Authentication error occurred'
    });
  }
};

// Optional middleware for routes that can work with or without authentication
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    try {
      const decoded = TokenService.verifyToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        tokenType: decoded.type
      };
      req.token = token;
    } catch (tokenError) {
      // Token is invalid but don't block the request
      console.warn('Optional auth token verification failed:', tokenError.message);
      req.user = null;
    }
    
    next();
  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    req.user = null;
    next();
  }
};

// Role-based authorization middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in to access this resource'
        });
      }
      
      const userRole = req.user.role || 'user';
      
      // Convert single role to array
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          message: `This resource requires one of the following roles: ${roles.join(', ')}`
        });
      }
      
      console.log(`Role authorization passed for user: ${req.user.email} with role: ${userRole}`);
      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authorization failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Authorization error occurred'
      });
    }
  };
};

// Admin only middleware
const requireAdmin = requireRole(['admin']);

// Provider or admin middleware
const requireProviderOrAdmin = requireRole(['provider', 'admin']);

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireProviderOrAdmin
};


// // auth-service/src/middleware/auth.middleware.js
// const TokenService = require('../services/token.service');
// const { StatusCodes } = require('http-status-codes');
// const logger = require('../config/logger');

// const authenticateToken = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Authorization header missing or malformed.' });
//     }
//     const token = authHeader.split(' ')[1];
//     if (!token) {
//       return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Token not provided.' });
//     }

//     const decoded = TokenService.verifyToken(token); // This will throw if invalid/expired
    
//     // Ensure it's an access token if your service differentiates
//     if (decoded.type !== 'access') {
//          logger.warn('Attempt to use non-access token for authentication.', { tokenType: decoded.type });
//          return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Invalid token type used for access.' });
//     }
    
//     req.user = {
//       userId: decoded.userId,
//       email: decoded.email,
//       role: decoded.role, // CRITICAL: role must be in the token payload
//     };
//     req.token = token;
//     logger.debug(`Authenticated request for user: ${decoded.email}, role: ${decoded.role}`);
//     next();
//   } catch (error) {
//     logger.warn('Authentication middleware error:', { name: error.name, message: error.message });
//     if (error.name === 'TokenExpiredError') {
//       return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Token expired. Please log in again.', code: 'TOKEN_EXPIRED' });
//     }
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Invalid token.', code: 'INVALID_TOKEN' });
//     }
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Authentication failed.' });
//   }
// };

// const requireRole = (allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user || !req.user.role) {
//       logger.warn('Authorization failed: User or role not found in request object.');
//       return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Authentication required.' });
//     }
//     const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
//     if (!roles.includes(req.user.role)) {
//       logger.warn(`Authorization failed: User ${req.user.email} with role '${req.user.role}' does not have required role(s): ${roles.join(', ')}`);
//       return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'You do not have permission to access this resource.' });
//     }
//     logger.debug(`Role authorization passed for user: ${req.user.email} with role: ${req.user.role}`);
//     next();
//   };
// };

// const requireAdmin = requireRole('admin'); // Specific middleware for admin role

// module.exports = {
//   authenticateToken,
//   requireAdmin,
//   requireRole 
// };
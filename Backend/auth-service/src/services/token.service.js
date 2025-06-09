// auth-service/src/services/token.service.js - Fixed version
const jwt = require('jsonwebtoken');
const config = require('../config'); // Adjust path as needed

class TokenService {
  constructor() {
    // Token blacklist for server-side token invalidation (optional)
    this.tokenBlacklist = new Set();
    
    // Configuration with fallbacks
    this.JWT_SECRET = config.JWT_SECRET || process.env.JWT_SECRET;
    this.JWT_REFRESH_SECRET = config.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET || this.JWT_SECRET;
    this.JWT_EXPIRES_IN = config.JWT_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m';
    this.JWT_REFRESH_EXPIRES_IN = config.JWT_REFRESH_EXPIRES_IN || process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET is required but not provided');
    }
    
    console.log('TokenService initialized with config:', {
      accessTokenExpiry: this.JWT_EXPIRES_IN,
      refreshTokenExpiry: this.JWT_REFRESH_EXPIRES_IN,
      hasRefreshSecret: !!this.JWT_REFRESH_SECRET
    });
  }

  // Generate access token (short-lived)
  generateToken(payload) {
    try {
      if (!payload || typeof payload !== 'object') {
        throw new Error('Token payload is required and must be an object');
      }
      
      const token = jwt.sign(
        { ...payload, type: 'access' }, 
        this.JWT_SECRET, 
        {
          expiresIn: this.JWT_EXPIRES_IN,
          issuer: 'Shikshaarthi', // ✅ Correct spelling
          audience: 'Shikshaarthi-users' // ✅ FIXED: Was "Shiskshaarthi-users" (missing 'a')
        }
      );
      
      console.log(`Access token generated for user: ${payload.userId}`);
      return token;
    } catch (error) {
      console.error('Error generating access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  // Generate refresh token (long-lived)
  generateRefreshToken(payload) {
    try {
      if (!payload || typeof payload !== 'object') {
        throw new Error('Token payload is required and must be an object');
      }
      
      const token = jwt.sign(
        { ...payload, type: 'refresh' }, 
        this.JWT_REFRESH_SECRET, 
        {
          expiresIn: this.JWT_REFRESH_EXPIRES_IN,
          issuer: 'Shikshaarthi', // ✅ Correct spelling
          audience: 'Shikshaarthi-users' // ✅ FIXED: Was "Shiskshaarthi-users" (missing 'a')
        }
      );
      
      console.log(`Refresh token generated for user: ${payload.userId}`);
      return token;
    } catch (error) {
      console.error('Error generating refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  // Verify access token
  verifyToken(token) {
    try {
      if (!token) {
        throw new Error('Token is required');
      }
      
      // Check if token is blacklisted
      if (this.tokenBlacklist.has(token)) {
        throw new Error('Token has been invalidated');
      }
      
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'Shikshaarthi', // ✅ Correct spelling
        audience: 'Shikshaarthi-users' // ✅ FIXED: Was "Shiskshaarthi-users" (missing 'a')
      });
      
      // Ensure it's an access token
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error.message);
      
      // Re-throw JWT-specific errors
      if (error.name === 'JsonWebTokenError' || 
          error.name === 'TokenExpiredError' || 
          error.name === 'NotBeforeError') {
        throw error;
      }
      
      throw new Error('Token verification failed');
    }
  }

  // Verify refresh token
  verifyRefreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        console.error('Refresh token is required but not provided');
        return null;
      }
      
      // Check if token is blacklisted
      if (this.tokenBlacklist.has(refreshToken)) {
        console.error('Refresh token has been invalidated');
        return null;
      }
      
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET, {
        issuer: 'Shikshaarthi', // ✅ Correct spelling
        audience: 'Shikshaarthi-users' // ✅ FIXED: Was "Shiskshaarthi-users" (missing 'a')
      });
      
      // Ensure it's a refresh token
      if (decoded.type !== 'refresh') {
        console.error('Invalid token type - expected refresh token');
        return null;
      }
      
      console.log(`Refresh token verified for user: ${decoded.userId}`);
      return decoded;
    } catch (error) {
      console.error('Refresh token verification failed:', error.message);
      return null;
    }
  }

  // Generate token pair (access + refresh)
  generateTokenPair(payload) {
    try {
      if (!payload || !payload.userId) {
        throw new Error('User ID is required in token payload');
      }
      
      console.log(`Generating token pair for user: ${payload.userId}`);
      
      const accessToken = this.generateToken(payload);
      const refreshToken = this.generateRefreshToken(payload);
      
      return {
        accessToken,
        refreshToken,
        expiresIn: this.JWT_EXPIRES_IN,
        tokenType: 'Bearer'
      };
    } catch (error) {
      console.error('Error generating token pair:', error);
      throw new Error('Failed to generate authentication tokens');
    }
  }

  // Decode token without verification (for expired tokens)
  decodeToken(token) {
    try {
      if (!token) {
        return null;
      }
      
      return jwt.decode(token, { complete: true });
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Get token expiration time
  getTokenExpiration(token) {
    try {
      const decoded = this.decodeToken(token);
      if (decoded && decoded.payload && decoded.payload.exp) {
        return new Date(decoded.payload.exp * 1000);
      }
      return null;
    } catch (error) {
      console.error('Error getting token expiration:', error);
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token) {
    try {
      const expiration = this.getTokenExpiration(token);
      if (!expiration) return true;
      
      return Date.now() >= expiration.getTime();
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  // Invalidate token (add to blacklist)
  invalidateToken(token) {
    try {
      if (token) {
        this.tokenBlacklist.add(token);
        console.log('Token added to blacklist');
        
        // Clean up blacklist periodically to prevent memory leaks
        this.cleanupBlacklist();
      }
    } catch (error) {
      console.error('Error invalidating token:', error);
    }
  }

  // Clean up expired tokens from blacklist
  cleanupBlacklist() {
    try {
      const now = Date.now();
      const tokensToRemove = [];
      
      for (const token of this.tokenBlacklist) {
        if (this.isTokenExpired(token)) {
          tokensToRemove.push(token);
        }
      }
      
      tokensToRemove.forEach(token => this.tokenBlacklist.delete(token));
      
      if (tokensToRemove.length > 0) {
        console.log(`Cleaned up ${tokensToRemove.length} expired tokens from blacklist`);
      }
    } catch (error) {
      console.error('Error cleaning up blacklist:', error);
    }
  }

  // Get token info without verification
  getTokenInfo(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.payload) {
        return null;
      }
      
      const payload = decoded.payload;
      const expiration = this.getTokenExpiration(token);
      
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        type: payload.type,
        issuedAt: payload.iat ? new Date(payload.iat * 1000) : null,
        expiresAt: expiration,
        isExpired: this.isTokenExpired(token),
        isBlacklisted: this.tokenBlacklist.has(token)
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      return null;
    }
  }

  // Health check for token service
  healthCheck() {
    return {
      status: 'healthy',
      blacklistSize: this.tokenBlacklist.size,
      hasJwtSecret: !!this.JWT_SECRET,
      hasRefreshSecret: !!this.JWT_REFRESH_SECRET,
      accessTokenExpiry: this.JWT_EXPIRES_IN,
      refreshTokenExpiry: this.JWT_REFRESH_EXPIRES_IN,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
const tokenService = new TokenService();

// Periodic cleanup of blacklist (every hour)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    tokenService.cleanupBlacklist();
  }, 60 * 60 * 1000); // 1 hour
}

module.exports = tokenService;


// // auth-service/src/services/token.service.js
// const jwt = require('jsonwebtoken');
// const config = require('../config');
// const logger = require('../config/logger'); // Assuming logger is available

// class TokenService {
//   constructor() {
//     this.JWT_SECRET = config.JWT_SECRET;
//     this.JWT_REFRESH_SECRET = config.JWT_REFRESH_SECRET || this.JWT_SECRET;
//     this.JWT_EXPIRES_IN = config.JWT_EXPIRES_IN || '1h';
//     this.JWT_REFRESH_EXPIRES_IN = config.JWT_REFRESH_EXPIRES_IN || '7d';

//     if (!this.JWT_SECRET) {
//       logger.error('FATAL: JWT_SECRET is not defined in TokenService constructor.');
//       throw new Error('JWT_SECRET is required for TokenService.');
//     }
//     logger.info('TokenService initialized successfully.', {
//       accessTokenExpiry: this.JWT_EXPIRES_IN,
//       refreshTokenExpiry: this.JWT_REFRESH_EXPIRES_IN,
//     });
//   }

//   // payload should include: userId, email, role
//   generateToken(payload) {
//     if (!payload || typeof payload !== 'object' || !payload.userId || !payload.email || !payload.role) {
//       logger.error('Token generation failed: Invalid payload.', { payload });
//       throw new Error('Valid payload (userId, email, role) is required to generate token.');
//     }
//     try {
//       return jwt.sign(
//         { ...payload, type: 'access', iss: 'Shikshaarthi', aud: 'Shikshaarthi-users' },
//         this.JWT_SECRET,
//         { expiresIn: this.JWT_EXPIRES_IN }
//       );
//     } catch (error) {
//       logger.error('Error generating access token:', { error: error.message, payload });
//       throw new Error('Failed to generate access token.');
//     }
//   }

//   generateRefreshToken(payload) {
//    if (!payload || typeof payload !== 'object' || !payload.userId || !payload.email || !payload.role) {
//      logger.error('Refresh token generation failed: Invalid payload.', { payload });
//      throw new Error('Valid payload (userId, email, role) is required to generate refresh token.');
//    }
//     try {
//       return jwt.sign(
//         { ...payload, type: 'refresh', iss: 'Shikshaarthi', aud: 'Shikshaarthi-users' },
//         this.JWT_REFRESH_SECRET,
//         { expiresIn: this.JWT_REFRESH_EXPIRES_IN }
//       );
//     } catch (error) {
//       logger.error('Error generating refresh token:', { error: error.message, payload });
//       throw new Error('Failed to generate refresh token.');
//     }
//   }

//   verifyToken(token) {
//     try {
//       return jwt.verify(token, this.JWT_SECRET, { audience: 'Shikshaarthi-users', issuer: 'Shikshaarthi' });
//     } catch (error) {
//       // Log specific JWT errors for better debugging
//       logger.warn(`Access token verification failed: ${error.name} - ${error.message}`);
//       throw error; // Re-throw to be handled by auth middleware
//     }
//   }

//   verifyRefreshToken(refreshToken) {
//     try {
//       const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET, { audience: 'Shikshaarthi-users', issuer: 'Shikshaarthi' });
//       if (decoded.type !== 'refresh') {
//         logger.warn('Invalid token type provided to verifyRefreshToken. Expected "refresh".', { type: decoded.type });
//         throw new Error('Invalid refresh token type.');
//       }
//       return decoded;
//     } catch (error) {
//       logger.warn(`Refresh token verification failed: ${error.name} - ${error.message}`);
//       return null; // Or re-throw if preferred
//     }
//   }

//   generateTokenPair(payload) { // Expects payload to have userId, email, AND role
//     logger.debug('Generating token pair for payload:', payload);
//     const accessToken = this.generateToken(payload);
//     const refreshToken = this.generateRefreshToken(payload);
//     const decodedAccessToken = jwt.decode(accessToken);

//     return {
//       accessToken,
//       refreshToken,
//       expiresIn: decodedAccessToken.exp ? decodedAccessToken.exp * 1000 : null, // Expiry in ms
//       tokenType: 'Bearer'
//     };
//   }
// }

// module.exports = new TokenService();
// rewards-service/src/middleware/rate-limit.middleware.js
const rateLimit = require('express-rate-limit');

// In-memory store for rate limiting (consider using Redis for production clusters)
class MemoryStore {
  constructor() {
    this.hits = new Map();
    this.resetTime = new Map();
  }

  incr(key, cb) {
    const now = Date.now();
    const resetTime = this.resetTime.get(key);
    
    if (!resetTime || now > resetTime) {
      this.hits.set(key, 1);
      this.resetTime.set(key, now + this.windowMs);
      return cb(null, 1, now + this.windowMs);
    }
    
    const hits = (this.hits.get(key) || 0) + 1;
    this.hits.set(key, hits);
    cb(null, hits, resetTime);
  }

  decrement(key) {
    const hits = this.hits.get(key);
    if (hits && hits > 0) {
      this.hits.set(key, hits - 1);
    }
  }

  resetKey(key) {
    this.hits.delete(key);
    this.resetTime.delete(key);
  }

  resetAll() {
    this.hits.clear();
    this.resetTime.clear();
  }

  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, resetTime] of this.resetTime.entries()) {
      if (now > resetTime) {
        this.hits.delete(key);
        this.resetTime.delete(key);
      }
    }
  }
}

// Global memory store instance
const globalStore = new MemoryStore();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  globalStore.cleanup();
}, 5 * 60 * 1000);

// Default rate limit configurations
const DEFAULT_CONFIGS = {
  global: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  },
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // requests per window
    message: 'Too many API requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
    message: 'Too many authentication requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  },
  submission: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // submissions per minute
    message: 'Too many submission requests, please wait before submitting again.',
    standardHeaders: true,
    legacyHeaders: false
  },
  admin: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // requests per minute
    message: 'Too many admin requests, please slow down.',
    standardHeaders: true,
    legacyHeaders: false
  },
  upload: {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // uploads per minute
    message: 'Too many file uploads, please wait before uploading again.',
    standardHeaders: true,
    legacyHeaders: false
  }
};

// Create rate limiter with custom configuration
const createRateLimiter = (config = {}) => {
  const finalConfig = {
    ...DEFAULT_CONFIGS.global,
    ...config,
    store: globalStore,
    keyGenerator: (req) => {
      // Use custom keyGenerator if provided
      if (config.keyGenerator && typeof config.keyGenerator === 'function') {
        return config.keyGenerator(req);
      }
      
      // Use IP address as default key
      let key = req.ip || req.connection.remoteAddress;
      
      // Include user ID if authenticated for more granular control
      if (req.user && req.user.id) {
        key = `${key}:${req.user.id}`;
      }
      
      // Include route for endpoint-specific limiting
      if (config.includeRoute) {
        key = `${key}:${req.route?.path || req.path}`;
      }
      
      return key;
    },
    handler: (req, res) => {
      const retryAfter = Math.round(config.windowMs / 1000) || 60;
      
      console.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}, User: ${req.user?.id || 'anonymous'}`);
      
      res.status(429).json({
        success: false,
        message: config.message || 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter,
        limit: config.max,
        windowMs: config.windowMs,
        requestId: req.requestId,
        timestamp: new Date().toISOString()
      });
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      if (req.path === '/health' || req.path === '/ready' || req.path === '/live') {
        return true;
      }
      
      // Skip for internal service calls
      if (req.headers['x-internal-service'] === 'true') {
        return true;
      }
      
      // Skip for specific user roles if configured
      if (config.skipRoles && req.user && config.skipRoles.includes(req.user.role)) {
        return true;
      }
      
      return false;
    }
    // REMOVED onLimitReached to fix deprecation warning
  };

  return rateLimit(finalConfig);
};

// Pre-configured rate limiters
const rateLimiters = {
  global: createRateLimiter(DEFAULT_CONFIGS.global),
  api: createRateLimiter(DEFAULT_CONFIGS.api),
  auth: createRateLimiter(DEFAULT_CONFIGS.auth),
  submission: createRateLimiter({
    ...DEFAULT_CONFIGS.submission,
    includeRoute: true
  }),
  admin: createRateLimiter({
    ...DEFAULT_CONFIGS.admin,
    skipRoles: ['superadmin']
  }),
  upload: createRateLimiter({
    ...DEFAULT_CONFIGS.upload,
    includeRoute: true
  })
};

// Flexible rate limiter that adjusts based on user type
const smartRateLimit = (options = {}) => {
  const baseConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    ...options
  };

  return (req, res, next) => {
    let limit = baseConfig.max;
    
    // Adjust limits based on user role
    if (req.user) {
      switch (req.user.role) {
        case 'superadmin':
          limit = limit * 10; // 10x more requests for superadmin
          break;
        case 'admin':
          limit = limit * 5; // 5x more requests for admin
          break;
        case 'verified':
          limit = limit * 2; // 2x more requests for verified users
          break;
        case 'premium':
          limit = limit * 3; // 3x more requests for premium users
          break;
        default:
          // Use base limit for regular users
          break;
      }
    }

    // Create dynamic rate limiter
    const dynamicLimiter = createRateLimiter({
      ...baseConfig,
      max: limit
    });

    return dynamicLimiter(req, res, next);
  };
};

// Rate limiter for specific endpoints
const endpointRateLimit = {
  // Login/Register endpoints
  auth: rateLimiters.auth,
  
  // Data submission endpoints
  submission: rateLimiters.submission,
  
  // File upload endpoints
  upload: rateLimiters.upload,
  
  // Admin endpoints
  admin: rateLimiters.admin,
  
  // General API endpoints
  api: rateLimiters.api,
  
  // Balance/coin related endpoints
  balance: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: 'Too many balance requests, please wait.'
  }),
  
  // Profile/user data endpoints
  profile: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 50, // 50 requests per minute
    message: 'Too many profile requests, please wait.'
  })
};

// Middleware to log rate limit info
const rateLimitLogger = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log rate limit headers if present
    if (res.get('X-RateLimit-Limit')) {
      console.log('Rate Limit Info:', {
        ip: req.ip,
        path: req.path,
        limit: res.get('X-RateLimit-Limit'),
        remaining: res.get('X-RateLimit-Remaining'),
        reset: res.get('X-RateLimit-Reset'),
        user: req.user?.id || 'anonymous'
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Progressive rate limiting (stricter limits for suspicious behavior)
const progressiveRateLimit = (options = {}) => {
  const suspiciousIPs = new Map();
  const baseConfig = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    ...options
  };

  return (req, res, next) => {
    const ip = req.ip;
    const suspicious = suspiciousIPs.get(ip);
    let limit = baseConfig.max;

    if (suspicious) {
      const violations = suspicious.violations || 0;
      // Reduce limit based on violations
      limit = Math.max(10, baseConfig.max - (violations * 20));
      
      console.warn(`Progressive rate limit applied to IP ${ip}: ${limit} requests (violations: ${violations})`);
    }

    const progressiveLimiter = createRateLimiter({
      ...baseConfig,
      max: limit
    });

    return progressiveLimiter(req, res, next);
  };
};

// Cleanup suspicious IPs periodically
setInterval(() => {
  const now = Date.now();
  const CLEANUP_AFTER = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [ip, data] of globalStore.hits.entries()) {
    if (now - data.lastViolation > CLEANUP_AFTER) {
      globalStore.hits.delete(ip);
    }
  }
}, 60 * 60 * 1000); // Cleanup every hour

// Export the main function for backward compatibility
module.exports = createRateLimiter;

// Also export as named exports
module.exports.createRateLimiter = createRateLimiter;
module.exports.rateLimiters = rateLimiters;
module.exports.endpointRateLimit = endpointRateLimit;
module.exports.smartRateLimit = smartRateLimit;
module.exports.progressiveRateLimit = progressiveRateLimit;
module.exports.rateLimitLogger = rateLimitLogger;
module.exports.DEFAULT_CONFIGS = DEFAULT_CONFIGS;

// Export individual limiters for convenience
module.exports.globalLimit = rateLimiters.global;
module.exports.apiLimit = rateLimiters.api;
module.exports.authLimit = rateLimiters.auth;
module.exports.submissionLimit = rateLimiters.submission;
module.exports.adminLimit = rateLimiters.admin;
module.exports.uploadLimit = rateLimiters.upload;
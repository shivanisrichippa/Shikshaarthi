
// middleware/rate-limit.middleware.js - Rate limiting for sensitive operations
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message, keyGenerator = null) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message
    },
    keyGenerator: keyGenerator || ((req) => req.ip),
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Rate limiters
const otpLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 OTP requests per windowMs
  'Too many OTP requests, please try again later.'
);

const loginLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // limit each IP to 10 login requests per windowMs
  'Too many login attempts, please try again later.'
);

const passwordResetLimit = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // limit each IP to 3 password reset requests per hour
  'Too many password reset requests, please try again later.'
);

// Rate limit reward redemptions per user to prevent abuse
const rewardRedemptionLimit = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // limit each user to 10 redemption attempts per hour
  'Too many redemption attempts, please try again later.',
  (req) => req.user?.id || req.ip // Use user ID if authenticated, otherwise IP
);

module.exports = {
  otpLimit,
  loginLimit,
  passwordResetLimit,
  rewardRedemptionLimit
};

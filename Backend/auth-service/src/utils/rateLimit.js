// auth-service/src/utils/rateLimit.js
const { getDb } = require('../shared/libs/database/mongo-connector');

// In-memory fallback for rate limiting
const rateLimitCache = new Map();

/**
 * Check if user is within rate limits for a specific action
 * @param {Object} db - Database connection
 * @param {string} identifier - User identifier (email, IP, etc.)
 * @param {string} action - Action type ('send_otp', 'login_attempt', etc.)
 * @param {number} limitMinutes - Time window in minutes
 * @param {number} maxAttempts - Maximum attempts allowed in time window
 * @returns {Promise<boolean>} - Whether the action is allowed
 */
const checkRateLimit = async (db, identifier, action, limitMinutes = 5, maxAttempts = 3) => {
  const normalizedIdentifier = identifier.toLowerCase();
  const rateLimitKey = `${normalizedIdentifier}:${action}`;
  const now = new Date();
  const windowStart = new Date(now.getTime() - (limitMinutes * 60 * 1000));

  try {
    // Try database first
    if (db) {
      const collection = db.collection('rate_limits');
      
      // Ensure collection and indexes exist
      try {
        const collections = await db.listCollections({ name: 'rate_limits' }).toArray();
        if (collections.length === 0) {
          await db.createCollection('rate_limits');
          
          // Create TTL index to auto-expire old records
          await collection.createIndex(
            { createdAt: 1 }, 
            { expireAfterSeconds: limitMinutes * 60 * 2 } // Keep records for 2x the limit window
          );
          
          // Create compound index for faster lookups
          await collection.createIndex({ identifier: 1, action: 1 });
        }
      } catch (indexError) {
        console.warn('Could not create rate limit indexes:', indexError);
      }

      // Count attempts in the current window
      const attemptCount = await collection.countDocuments({
        identifier: normalizedIdentifier,
        action: action,
        createdAt: { $gte: windowStart }
      });

      if (attemptCount >= maxAttempts) {
        console.log(`Rate limit exceeded for ${normalizedIdentifier}:${action} - ${attemptCount}/${maxAttempts} attempts`);
        return false;
      }

      // Record this attempt
      await collection.insertOne({
        identifier: normalizedIdentifier,
        action: action,
        createdAt: now,
        ip: null, // Can be enhanced to include IP address
        userAgent: null // Can be enhanced to include user agent
      });

      console.log(`Rate limit check passed for ${normalizedIdentifier}:${action} - ${attemptCount + 1}/${maxAttempts} attempts`);
      return true;
    }
  } catch (dbError) {
    console.warn('Database rate limiting failed, falling back to memory cache:', dbError);
  }

  // Fallback to in-memory rate limiting
  try {
    const cacheEntry = rateLimitCache.get(rateLimitKey) || { attempts: [], createdAt: now };
    
    // Filter out old attempts outside the time window
    cacheEntry.attempts = cacheEntry.attempts.filter(timestamp => timestamp >= windowStart);
    
    if (cacheEntry.attempts.length >= maxAttempts) {
      console.log(`Memory rate limit exceeded for ${normalizedIdentifier}:${action} - ${cacheEntry.attempts.length}/${maxAttempts} attempts`);
      return false;
    }
    
    // Record this attempt
    cacheEntry.attempts.push(now);
    rateLimitCache.set(rateLimitKey, cacheEntry);
    
    console.log(`Memory rate limit check passed for ${normalizedIdentifier}:${action} - ${cacheEntry.attempts.length}/${maxAttempts} attempts`);
    return true;
  } catch (cacheError) {
    console.error('Both database and memory rate limiting failed:', cacheError);
    // In case of complete failure, allow the request (fail open)
    return true;
  }
};

/**
 * Reset rate limit for a specific identifier and action
 * @param {Object} db - Database connection
 * @param {string} identifier - User identifier
 * @param {string} action - Action type
 * @returns {Promise<boolean>} - Success status
 */
const resetRateLimit = async (db, identifier, action) => {
  const normalizedIdentifier = identifier.toLowerCase();
  const rateLimitKey = `${normalizedIdentifier}:${action}`;

  try {
    // Clear from database
    if (db) {
      await db.collection('rate_limits').deleteMany({
        identifier: normalizedIdentifier,
        action: action
      });
    }
    
    // Clear from cache
    rateLimitCache.delete(rateLimitKey);
    
    console.log(`Rate limit reset for ${normalizedIdentifier}:${action}`);
    return true;
  } catch (error) {
    console.error('Failed to reset rate limit:', error);
    return false;
  }
};

/**
 * Get current rate limit status for an identifier and action
 * @param {Object} db - Database connection
 * @param {string} identifier - User identifier
 * @param {string} action - Action type
 * @param {number} limitMinutes - Time window in minutes
 * @param {number} maxAttempts - Maximum attempts allowed
 * @returns {Promise<Object>} - Rate limit status
 */
const getRateLimitStatus = async (db, identifier, action, limitMinutes = 5, maxAttempts = 3) => {
  const normalizedIdentifier = identifier.toLowerCase();
  const now = new Date();
  const windowStart = new Date(now.getTime() - (limitMinutes * 60 * 1000));

  try {
    let attemptCount = 0;
    let oldestAttempt = null;

    // Check database first
    if (db) {
      const attempts = await db.collection('rate_limits')
        .find({
          identifier: normalizedIdentifier,
          action: action,
          createdAt: { $gte: windowStart }
        })
        .sort({ createdAt: 1 })
        .toArray();

      attemptCount = attempts.length;
      oldestAttempt = attempts.length > 0 ? attempts[0].createdAt : null;
    } else {
      // Fallback to cache
      const rateLimitKey = `${normalizedIdentifier}:${action}`;
      const cacheEntry = rateLimitCache.get(rateLimitKey);
      
      if (cacheEntry) {
        const validAttempts = cacheEntry.attempts.filter(timestamp => timestamp >= windowStart);
        attemptCount = validAttempts.length;
        oldestAttempt = validAttempts.length > 0 ? Math.min(...validAttempts) : null;
      }
    }

    const remainingAttempts = Math.max(0, maxAttempts - attemptCount);
    const isBlocked = attemptCount >= maxAttempts;
    
    // Calculate when the user can try again
    let resetTime = null;
    if (isBlocked && oldestAttempt) {
      resetTime = new Date(oldestAttempt.getTime() + (limitMinutes * 60 * 1000));
    }

    return {
      identifier: normalizedIdentifier,
      action,
      currentAttempts: attemptCount,
      maxAttempts,
      remainingAttempts,
      isBlocked,
      windowStart,
      windowEnd: new Date(now.getTime() + (limitMinutes * 60 * 1000)),
      resetTime,
      canRetryAt: resetTime
    };
  } catch (error) {
    console.error('Failed to get rate limit status:', error);
    return {
      identifier: normalizedIdentifier,
      action,
      currentAttempts: 0,
      maxAttempts,
      remainingAttempts: maxAttempts,
      isBlocked: false,
      error: error.message
    };
  }
};

// Clean up expired entries from memory cache periodically
setInterval(() => {
  const fiveMinutesAgo = new Date(Date.now() - (5 * 60 * 1000));
  
  for (const [key, entry] of rateLimitCache.entries()) {
    // Filter out old attempts
    if (entry.attempts) {
      entry.attempts = entry.attempts.filter(timestamp => timestamp >= fiveMinutesAgo);
      
      // Remove empty entries
      if (entry.attempts.length === 0) {
        rateLimitCache.delete(key);
      } else {
        rateLimitCache.set(key, entry);
      }
    } else if (entry.createdAt < fiveMinutesAgo) {
      rateLimitCache.delete(key);
    }
  }
}, 2 * 60 * 1000); // Clean every 2 minutes

module.exports = {
  checkRateLimit,
  resetRateLimit,
  getRateLimitStatus
};
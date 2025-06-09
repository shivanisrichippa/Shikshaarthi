// auth-service/src/services/rate-limit.service.js
const { getDb } = require('../shared/libs/database/mongo-connector');

/**
 * Rate limiting function
 * @param {Object} db - Database connection
 * @param {string} identifier - User identifier (email, IP, etc.)
 * @param {string} action - Action type (send_otp, resend_otp, forgot_password)
 * @param {number} windowMinutes - Time window in minutes
 * @param {number} maxAttempts - Maximum attempts allowed
 * @returns {Promise<boolean>} - Whether action is allowed
 */
const checkRateLimit = async (db, identifier, action, windowMinutes, maxAttempts) => {
  if (!db) {
    console.warn('Database not available for rate limiting - allowing request');
    return true;
  }

  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - (windowMinutes * 60 * 1000));
    
    const collection = 'ratelimits';
    
    // Ensure collection exists
    const collections = await db.listCollections({ name: collection }).toArray();
    if (collections.length === 0) {
      await db.createCollection(collection);
      
      // Create TTL index for auto-cleanup
      await db.collection(collection).createIndex(
        { "createdAt": 1 }, 
        { expireAfterSeconds: 86400 } // Clean up after 24 hours
      );
      
      // Create compound index for queries
      await db.collection(collection).createIndex({ identifier: 1, action: 1 });
    }

    // Count recent attempts
    const recentAttempts = await db.collection(collection).countDocuments({
      identifier: identifier.toLowerCase(),
      action: action,
      createdAt: { $gte: windowStart }
    });

    if (recentAttempts >= maxAttempts) {
      return false;
    }

    // Record this attempt
    await db.collection(collection).insertOne({
      identifier: identifier.toLowerCase(),
      action: action,
      createdAt: now
    });

    return true;
  } catch (error) {
    console.error('Rate limit check error:', error);
    // In case of error, allow the request to avoid blocking legitimate users
    return true;
  }
};

module.exports = {
  checkRateLimit
};

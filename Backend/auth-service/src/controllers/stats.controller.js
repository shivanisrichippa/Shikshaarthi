// auth-service/src/controllers/stats.controller.js
const { getDb } = require('../../../shared/libs/database/mongo-connector');

/**
 * Get platform statistics including user counts and other metrics
 */
exports.getPlatformStats = async (req, res) => {
  try {
    const db = getDb();
    if (!db) {
      console.error("Database connection not established in stats controller");
      return res.status(503).json({ 
        error: 'Service temporarily unavailable',
        details: 'Database connection unavailable. Please try again in a few moments.' 
      });
    }

    console.log('Fetching platform statistics...');

    // Initialize stats object with default values
    const stats = {
      totalUsers: 0,
      activeUsers: 0,
      verifiedUsers: 0,
      serviceProviders: 0,
      totalSubmissions: 0,
      pendingSubmissions: 0
    };

    try {
      // Get total registered users count
      const totalUsersResult = await db.collection('users').countDocuments({});
      stats.totalUsers = totalUsersResult || 0;
      console.log(`Total users count: ${stats.totalUsers}`);

      // Get active users (users with subscription status 'active')
      const activeUsersResult = await db.collection('users').countDocuments({
        subscriptionStatus: 'active'
      });
      stats.activeUsers = activeUsersResult || 0;
      console.log(`Active users count: ${stats.activeUsers}`);

      // Get verified users (users with emailVerified: true)
      const verifiedUsersResult = await db.collection('users').countDocuments({
        emailVerified: true
      });
      stats.verifiedUsers = verifiedUsersResult || 0;
      console.log(`Verified users count: ${stats.verifiedUsers}`);

      // Get service providers (users with role 'provider')
      const serviceProvidersResult = await db.collection('users').countDocuments({
        role: 'provider'
      });
      stats.serviceProviders = serviceProvidersResult || 0;
      console.log(`Service providers count: ${stats.serviceProviders}`);

      // Try to get submission stats if datasubmissions collection exists
      try {
        const collections = await db.listCollections({ name: 'datasubmissions' }).toArray();
        if (collections.length > 0) {
          // Get total submissions
          const totalSubmissionsResult = await db.collection('datasubmissions').countDocuments({});
          stats.totalSubmissions = totalSubmissionsResult || 0;

          // Get pending submissions
          const pendingSubmissionsResult = await db.collection('datasubmissions').countDocuments({
            status: 'pending'
          });
          stats.pendingSubmissions = pendingSubmissionsResult || 0;
        }
      } catch (submissionError) {
        console.warn('Could not fetch submission statistics:', submissionError.message);
        // Keep default values for submission stats
      }

    } catch (queryError) {
      console.error('Error executing database queries:', queryError);
      
      // If specific queries fail, try to get at least basic user count
      try {
        const basicUserCount = await db.collection('users').estimatedDocumentCount();
        stats.totalUsers = basicUserCount || 0;
        console.log(`Fallback: Basic user count: ${stats.totalUsers}`);
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        // Return default stats with error indication
        return res.status(206).json({
          success: true,
          message: 'Partial statistics retrieved',
          data: stats,
          warning: 'Some statistics may not be current due to database issues'
        });
      }
    }

    // Calculate additional metrics
    const additionalMetrics = {
      userGrowthPercentage: stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0,
      verificationRate: stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0,
      lastUpdated: new Date().toISOString()
    };

    console.log('Platform statistics retrieved successfully:', stats);

    res.json({
      success: true,
      message: 'Platform statistics retrieved successfully',
      data: {
        ...stats,
        ...additionalMetrics
      }
    });

  } catch (error) {
    console.error('Platform statistics error:', error);
    
    // Return basic fallback response
    const fallbackStats = {
      totalUsers: 0,
      activeUsers: 0,
      verifiedUsers: 0,
      serviceProviders: 0,
      totalSubmissions: 0,
      pendingSubmissions: 0,
      lastUpdated: new Date().toISOString()
    };

    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve platform statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      data: fallbackStats // Provide fallback data even on error
    });
  }
};

/**
 * Get user-specific statistics (for authenticated users)
 */
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to view your statistics'
      });
    }

    const db = getDb();
    if (!db) {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable',
        details: 'Database connection unavailable.' 
      });
    }

    // Get user's basic information
    const user = await db.collection('users').findOne(
      { _id: new require('mongoose').Types.ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found'
      });
    }

    const userStats = {
      accountCreated: user.createdAt,
      coins: user.coins || 0,
      subscriptionStatus: user.subscriptionStatus || 'none',
      role: user.role || 'user',
      emailVerified: user.emailVerified || false,
      totalSubmissions: 0,
      approvedSubmissions: 0
    };

    // Try to get user's submission statistics
    try {
      const collections = await db.listCollections({ name: 'datasubmissions' }).toArray();
      if (collections.length > 0) {
        const userSubmissions = await db.collection('datasubmissions').countDocuments({
          userId: new require('mongoose').Types.ObjectId(userId)
        });
        userStats.totalSubmissions = userSubmissions || 0;

        const approvedSubmissions = await db.collection('datasubmissions').countDocuments({
          userId: new require('mongoose').Types.ObjectId(userId),
          status: 'approved'
        });
        userStats.approvedSubmissions = approvedSubmissions || 0;
      }
    } catch (submissionError) {
      console.warn('Could not fetch user submission statistics:', submissionError.message);
    }

    res.json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: userStats
    });

  } catch (error) {
    console.error('User statistics error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve user statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
// frontend/src/services/statsService.js
const API_BASE_URL =  import.meta.env.VITE_BACKEND_AUTH_URL;

/**
 * Service for handling platform statistics API calls
 */
class StatsService {
  /**
   * Get platform statistics (public endpoint)
   * @returns {Promise<Object>} Platform statistics data
   */
  async getPlatformStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats/platform`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch platform statistics');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      
      // Return fallback data in case of error
      return {
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        serviceProviders: 0,
        totalSubmissions: 0,
        pendingSubmissions: 0,
        userGrowthPercentage: 0,
        verificationRate: 0,
        lastUpdated: new Date().toISOString(),
        error: true,
        errorMessage: error.message
      };
    }
  }

  /**
   * Get user-specific statistics (requires authentication)
   * @param {string} token - JWT authentication token
   * @returns {Promise<Object>} User statistics data
   */
  async getUserStats(token) {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }

      const response = await fetch(`${API_BASE_URL}/api/stats/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch user statistics');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error; // Re-throw for component to handle
    }
  }

  /**
   * Format numbers for display with appropriate suffixes
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Get cached stats if available and not expired
   * @returns {Object|null} Cached stats or null
   */
  getCachedStats() {
    try {
      const cached = localStorage.getItem('platformStats');
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const cacheExpiry = 5 * 60 * 1000; // 5 minutes

      if (now - timestamp < cacheExpiry) {
        return data;
      }
    } catch (error) {
      console.warn('Error reading cached stats:', error);
    }
    return null;
  }

  /**
   * Cache stats data
   * @param {Object} stats - Stats data to cache
   */
  setCachedStats(stats) {
    try {
      const cacheData = {
        data: stats,
        timestamp: Date.now()
      };
      localStorage.setItem('platformStats', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error caching stats:', error);
    }
  }

  /**
   * Get stats with caching support
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Object>} Stats data
   */
  async getStatsWithCache(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = this.getCachedStats();
      if (cached) {
        return cached;
      }
    }

    const stats = await this.getPlatformStats();
    
    if (!stats.error) {
      this.setCachedStats(stats);
    }
    
    return stats;
  }
}

// Create singleton instance
const statsService = new StatsService();

export default statsService;
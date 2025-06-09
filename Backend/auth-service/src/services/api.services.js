// services/api.service.js
class ApiService {
    constructor() {
      this.baseURL = process.env.REACT_APP_API_URL || '';
    }
  
    // Helper method to get auth headers
    getAuthHeaders() {
      const token = localStorage.getItem('token');
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
  
    // Generic API call method
    async apiCall(endpoint, options = {}) {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getAuthHeaders(),
        ...options
      };
  
      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          // Handle different HTTP status codes
          switch (response.status) {
            case 401:
              // Unauthorized - redirect to login or refresh token
              localStorage.removeItem('token');
              window.location.href = '/admin/login';
              throw new Error('Session expired. Please login again.');
            case 403:
              throw new Error('Access denied. Insufficient permissions.');
            case 404:
              throw new Error('Resource not found.');
            case 422:
              throw new Error('Validation error. Please check your input.');
            case 500:
              throw new Error('Server error. Please try again later.');
            default:
              throw new Error(`Request failed: ${response.statusText}`);
          }
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('Network error. Please check your connection.');
        }
        throw error;
      }
    }
  }
  
  // User API Service
  class UserApiService extends ApiService {
    // Get all users with filters and pagination
    async getAllUsers(params = {}) {
      const searchParams = new URLSearchParams();
      
      // Add parameters to search params
      Object.entries(params).forEach(([key, value]) => {
        if (value && value !== 'ALL' && value !== '') {
          searchParams.append(key, value);
        }
      });
  
      return this.apiCall(`/api/admin/users?${searchParams}`);
    }
  
    // Get single user by ID
    async getUserById(userId) {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return this.apiCall(`/api/admin/users/${userId}`);
    }
  
    // Create new user
    async createUser(userData) {
      if (!userData) {
        throw new Error('User data is required');
      }
      return this.apiCall('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    }
  
    // Update user
    async updateUser(userId, userData) {
      if (!userId) {
        throw new Error('User ID is required');
      }
      if (!userData) {
        throw new Error('User data is required');
      }
      return this.apiCall(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    }
  
    // Delete user (soft delete)
    async deleteUser(userId) {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return this.apiCall(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
    }
  
    // Toggle user status (active/inactive)
    async toggleUserStatus(userId) {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return this.apiCall(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH'
      });
    }
  
    // Toggle user verification status
    async toggleUserVerification(userId) {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return this.apiCall(`/api/admin/users/${userId}/toggle-verification`, {
        method: 'PATCH'
      });
    }
  
    // Bulk operations
    async bulkUpdateUsers(userIds, updateData) {
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new Error('User IDs array is required');
      }
      return this.apiCall('/api/admin/users/bulk-update', {
        method: 'PATCH',
        body: JSON.stringify({ userIds, updateData })
      });
    }
  
    async bulkDeleteUsers(userIds) {
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new Error('User IDs array is required');
      }
      return this.apiCall('/api/admin/users/bulk-delete', {
        method: 'DELETE',
        body: JSON.stringify({ userIds })
      });
    }
  }
  
  // Admin API Service
  class AdminApiService extends ApiService {
    // Admin login
    async login(credentials) {
      if (!credentials || !credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }
      return this.apiCall('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
    }
  
    // Create new admin
    async createAdmin(adminData) {
      if (!adminData || !adminData.email || !adminData.password) {
        throw new Error('Email and password are required');
      }
      return this.apiCall('/api/admin/create', {
        method: 'POST',
        body: JSON.stringify(adminData)
      });
    }
  
    // Get admin profile
    async getProfile() {
      return this.apiCall('/api/admin/profile');
    }
  
    // Update admin profile
    async updateProfile(profileData) {
      return this.apiCall('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
    }
  
    // Get dashboard stats
    async getDashboardStats() {
      return this.apiCall('/api/admin/dashboard/stats');
    }
  }
  
  // Statistics API Service
  class StatsApiService extends ApiService {
    // Get user statistics
    async getUserStats(timeframe = '30d') {
      return this.apiCall(`/api/admin/stats/users?timeframe=${timeframe}`);
    }
  
    // Get system statistics
    async getSystemStats() {
      return this.apiCall('/api/admin/stats/system');
    }
  
    // Get activity logs
    async getActivityLogs(params = {}) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
      return this.apiCall(`/api/admin/activity-logs?${searchParams}`);
    }
  }
  
  // Export instances
  export const userAPI = new UserApiService();
  export const adminAPI = new AdminApiService();
  export const statsAPI = new StatsApiService();
  
  // Export classes for custom instantiation if needed
  export { UserApiService, AdminApiService, StatsApiService };
  
  // Utility functions
  export const formatApiError = (error) => {
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  };
  
  export const handleApiResponse = (response) => {
    if (response && response.success) {
      return response;
    }
    throw new Error(response?.message || 'Request failed');
  };
  
  // Hook for API calls with loading states
  export const useApiCall = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const executeApiCall = useCallback(async (apiFunction, ...args) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await apiFunction(...args);
        return result;
      } catch (err) {
        const errorMessage = formatApiError(err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []);
  
    return { executeApiCall, isLoading, error, setError };
  };
  
  // Default export for backward compatibility
  export default {
    userAPI,
    adminAPI,
    statsAPI
  };
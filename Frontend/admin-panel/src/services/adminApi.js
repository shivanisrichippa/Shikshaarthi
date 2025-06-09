// src/services/adminApi.js

import { toast } from 'sonner';

// --- Helper Functions ---

const getAuthToken = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        console.error("Admin auth token not found. Please log in.");
        // We don't toast here because this is called on every request.
        // The error will be thrown and caught by the calling function.
    }
    return token;
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
            message: `Request failed with status ${response.status}` 
        }));
        console.error('API Error:', { status: response.status, url: response.url, errorData });
        throw new Error(errorData.message || `An unexpected error occurred (HTTP ${response.status}).`);
    }
    return response.json();
};

// --- API Service URLs ---
const AUTH_API_URL = import.meta.env.VITE_BACKEND_AUTH_URL || 'http://localhost:3001/api';
const REWARDS_API_URL = import.meta.env.VITE_BACKEND_REWARDS_URL || 'http://localhost:3002/api/rewards';

// ===================================
// USER API (auth-service)
// ===================================
export const userAPI = {
    getAllUsers: async (params = {}) => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required.");
        const searchParams = new URLSearchParams(params);
        const response = await fetch(`${AUTH_API_URL}/admin/users?${searchParams.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response);
    },

    getUserById: async (userId) => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required.");
        const response = await fetch(`${AUTH_API_URL}/admin/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response);
    },

    updateUser: async (userId, userData) => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required.");
        const response = await fetch(`${AUTH_API_URL}/admin/users/${userId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return handleResponse(response);
    },

    deleteUser: async (userId) => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required.");
        const response = await fetch(`${AUTH_API_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response);
    },

    toggleUserStatus: async (userId) => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required.");
        const response = await fetch(`${AUTH_API_URL}/admin/users/${userId}/toggle-status`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response);
    },

    toggleUserVerification: async (userId) => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required.");
        const response = await fetch(`${AUTH_API_URL}/admin/users/${userId}/toggle-verification`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response);
    }
};

// ==========================================================
// SUBMISSION & NOTIFICATION API (rewards-service)
// ==========================================================
export const submissionAPI = {
    getSubmissions: async (params = {}) => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required.");
        const searchParams = new URLSearchParams(params);
        const response = await fetch(`${REWARDS_API_URL}/admin/submissions?${searchParams.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response);
    },

    getSubmissionDetails: async (submissionId) => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required.");
        const response = await fetch(`${REWARDS_API_URL}/admin/submissions/${submissionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response);
    },

    approveSubmission: async (submissionId, adminNotes = '') => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required.");
        const response = await fetch(`${REWARDS_API_URL}/admin/submissions/${submissionId}/approve`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminNotes })
        });
        return handleResponse(response);
    },

    rejectSubmission: async (submissionId, reason) => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required.");
        const requestBody = { adminNotes: reason };
        const response = await fetch(`${REWARDS_API_URL}/admin/submissions/${submissionId}/reject`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        return handleResponse(response);
    },
    
    // --- NOTIFICATION FUNCTIONS NOW CORRECTLY PLACED ---
    getAdminNotifications: async () => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required.");
        // This endpoint MUST exist on your rewards-service backend
        const response = await fetch(`${REWARDS_API_URL}/admin/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response);
    },

    markNotificationAsRead: async (notificationId) => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required.");
        // This endpoint MUST exist on your rewards-service backend
        const response = await fetch(`${REWARDS_API_URL}/admin/notifications/${notificationId}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response);
    }
};

// ===================================
// COIN API (rewards-service)
// ===================================
export const coinAPI = {
    getUserTransactions: async (userId) => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required.");
        // This endpoint MUST exist on your rewards-service backend for admins
        const response = await fetch(`${REWARDS_API_URL}/admin/users/${userId}/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response);
    },

  /**
   * Get user's coin redemption history
   * @param {string} userId - The user ID
   * @returns {Promise} API response with redemption history
   */
  getUserRedemptionHistory: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/redemption-history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user redemption history:', error);
      throw error;
    }
  }

};

// ===================================
// EMAIL API (auth-service)
// ===================================
export const emailAPI = {
    sendRewardEmail: async (emailData) => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required.");
        const response = await fetch(`${AUTH_API_URL}/admin/send-reward-email`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        });
        return handleResponse(response);
    }
};
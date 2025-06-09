// src/services/submissionApi.js

const getAuthToken = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        console.error("Admin authentication token not found in localStorage under the key 'adminToken'");
    }
    return token;
};

const getApiUrl = () => {
    return import.meta.env.VITE_BACKEND_REWARDS_URL || 'http://localhost:3002/api/rewards';
};

/**
 * Centralized function to handle API responses and errors.
 */
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
            message: `Request failed with status code ${response.status}` 
        }));
        
        console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            errorData
        });
        
        throw new Error(errorData.message || `An unexpected error occurred (HTTP ${response.status}).`);
    }
    return response.json();
};

/**
 * The submissionAPI service object for all admin actions related to data submissions.
 */
export const submissionAPI = {
    /**
     * Fetches all submissions based on status and other filters.
     */
    getSubmissions: async (params = {}) => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required. Please log in.");

        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        if (params.status) searchParams.append('status', params.status);
        if (params.serviceType) searchParams.append('serviceType', params.serviceType);
        
        const response = await fetch(`${getApiUrl()}/admin/submissions?${searchParams.toString()}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return handleResponse(response);
    },

    /**
     * Fetches the full details of a single submission.
     */
    getSubmissionDetails: async (submissionId) => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required. Please log in.");
        
        const response = await fetch(`${getApiUrl()}/admin/submissions/${submissionId}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return handleResponse(response);
    },

    /**
     * Updates the service-specific data within a submission.
     */
    updateSubmissionData: async (submissionId, updatedData) => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required. Please log in.");
        
        const response = await fetch(`${getApiUrl()}/admin/submissions/${submissionId}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(updatedData)
        });
        return handleResponse(response);
    },

    /**
     * Approves a submission.
     */
    approveSubmission: async (submissionId, adminNotes = '') => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required. Please log in.");
        
        const response = await fetch(`${getApiUrl()}/admin/submissions/${submissionId}/approve`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ adminNotes })
        });
        return handleResponse(response);
    },

    /**
     * Rejects a submission with a required reason.
     */
    rejectSubmission: async (submissionId, reason) => {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication required. Please log in.");

        // --- CLARITY FIX: The body should contain 'adminNotes' as the key ---
        const requestBody = { adminNotes: reason };

        const response = await fetch(`${getApiUrl()}/admin/submissions/${submissionId}/reject`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(requestBody) // Send the correct body
        });
        return handleResponse(response);
    }
};
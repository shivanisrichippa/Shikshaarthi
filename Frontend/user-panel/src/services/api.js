
// // src/services/api.js
// import axios from 'axios';
// import { toast } from 'sonner'; // Assuming Sonner is used globally
// import tokenService from '../utils/tokenService'; // Adjust path as needed

// const API_BASE_URL_REWARDS = import.meta.env.VITE_BACKEND_REWARDS_URL || 'http://localhost:3002/api/rewards';

// const getAuthToken = () => {
//   return tokenService.getToken();
// };

// const apiClientRewards = axios.create({
//   baseURL: API_BASE_URL_REWARDS,
//   timeout: 30000, // Default timeout for most requests
// });

// const ongoingRequests = new Set(); // To prevent multiple token refresh attempts

// apiClientRewards.interceptors.request.use(
//   (config) => {
//     const token = getAuthToken();
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
    
//     // Longer timeout for submission endpoint specifically
//     if (config.url === '/submissions' && config.method?.toLowerCase() === 'post') {
//       config.timeout = 180000; // 3 minutes for submissions with image uploads
//     }
    
//     if (import.meta.env.DEV) {
//       // console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url} (Timeout: ${config.timeout}ms)`);
//     }
//     config.metadata = { startTime: new Date() }; // For duration logging
//     return config;
//   },
//   (error) => {
//     console.error('Rewards Service Request Setup Error:', error);
//     toast.error('Failed to setup request. Please check your connection.');
//     return Promise.reject(error);
//   }
// );

// apiClientRewards.interceptors.response.use(
//   (response) => {
//     if (import.meta.env.DEV) {
//       const duration = response.config.metadata?.startTime ? new Date().getTime() - response.config.metadata.startTime.getTime() : 'N/A';
//       // console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
//     }
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;
    
//     if (import.meta.env.DEV) {
//       const duration = originalRequest?.metadata?.startTime ? new Date().getTime() - originalRequest.metadata.startTime.getTime() : 'N/A';
//       console.error('❌ Rewards API Error Intercepted:', {
//         url: originalRequest?.url,
//         method: originalRequest?.method,
//         status: error.response?.status,
//         message: error.message,
//         data: error.response?.data,
//         duration: `${duration}ms`,
//       });
//     }

//     const toastOptions = { duration: 5000 };

//     if (!error.response) {
//       if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
//         const timeoutDuration = (originalRequest.timeout || apiClientRewards.defaults.timeout) / 1000;
//         toast.error(`Request timed out after ${timeoutDuration}s. The server might be busy or your connection unstable. Please try again.`, toastOptions);
//       } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
//         toast.error('Network Error. Please check your internet connection and if the server is running.', toastOptions);
//       } else {
//         toast.error('A connection problem occurred. Please check your network.', toastOptions);
//       }
//       return Promise.reject(error);
//     }

//     const { status, data } = error.response;
    
//     // Handle 401 for token refresh (simplified)
//     if (status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') { // Avoid refresh loop
//       originalRequest._retry = true;
//       if (ongoingRequests.has('token-refresh')) {
//         // console.warn('Token refresh already in progress. Queuing request.');
//         return new Promise((resolve, reject) => { // Basic queuing
//             const interval = setInterval(() => {
//                 if (!ongoingRequests.has('token-refresh')) {
//                     clearInterval(interval);
//                     apiClientRewards(originalRequest).then(resolve).catch(reject);
//                 }
//             }, 100);
//         });
//       }
//       ongoingRequests.add('token-refresh');
//       let refreshToastId = toast.loading('Session may have expired. Attempting to refresh...');
//       try {
//         const refreshResult = await tokenService.ensureValidToken(); // This should internally call your auth service refresh endpoint
//         if (refreshResult.success) {
//           toast.success('Session refreshed. Resuming request...', { id: refreshToastId });
//           originalRequest.headers['Authorization'] = `Bearer ${tokenService.getToken()}`;
//           ongoingRequests.delete('token-refresh');
//           return apiClientRewards(originalRequest);
//         } else {
//           throw new Error(refreshResult.error || 'Automatic token refresh failed.');
//         }
//       } catch (refreshError) {
//         toast.error(refreshError.message.includes('Invalid refresh token') ? 'Your session has expired. Please login again.' : 'Session refresh failed. Please login again.', { id: refreshToastId });
//         tokenService.clearTokens(); // Clear tokens and redirect to login
//         // Consider redirecting: window.location.href = '/login';
//         ongoingRequests.delete('token-refresh');
//         return Promise.reject(error); // Reject original error
//       }
//     }

//     // Specific status code error messages
//     switch (status) {
//       case 400:
//         toast.error(data?.message || 'Bad Request. Please check your input.', toastOptions);
//         if (data?.errors) console.error("Validation Errors:", data.errors);
//         break;
//       case 401: // If retry already happened or it's another 401
//         toast.error(data?.message || 'Authentication Failed. Please login again.', toastOptions);
//         tokenService.clearTokens();
//         // window.location.href = '/login';
//         break;
//       case 403:
//         toast.error(data?.message || 'Forbidden. You do not have permission to perform this action.', toastOptions);
//         break;
//       case 404:
//         toast.error(data?.message || 'The requested resource was not found on the server.', toastOptions);
//         break;
//       case 413:
//           toast.error(data?.message || 'The uploaded file(s) are too large. Please reduce the size and try again.', toastOptions);
//           break;
//       case 429:
//         toast.error('Too many requests. Please wait a moment and try again.', toastOptions);
//         break;
//       case 500:
//         toast.error(data?.message || 'An internal server error occurred. Our team has been notified.', toastOptions);
//         break;
//       case 502:
//       case 503:
//         toast.error(data?.message || 'The service is temporarily unavailable. Please try again shortly.', toastOptions);
//         break;
//       default:
//         toast.error(data?.message || `An unexpected error occurred (Status: ${status}).`, toastOptions);
//     }
//     return Promise.reject(error);
//   }
// );

// export const submitServiceDataApi = async (
//   serviceType,
//   data, // This is the JSON object with form fields
//   imageFiles, // This is an array of File objects
//   onUploadProgressCallback,
//   onProcessingStartCallback // Renamed for clarity
// ) => {
//   if (!serviceType || typeof serviceType !== 'string') {
//     throw new Error('Invalid service type provided to API function.');
//   }
//   if (!data || typeof data !== 'object') {
//     throw new Error('Invalid service data provided to API function.');
//   }
//   // imageFiles can be an empty array if no images are required or uploaded for a service

//   const formData = new FormData();
//   formData.append('serviceType', serviceType);
//   formData.append('data', JSON.stringify(data)); // 'data' field as a JSON string

//   if (imageFiles && imageFiles.length > 0) {
//     imageFiles.forEach((file) => {
//       if (file instanceof File) {
//         formData.append('images', file); // Use 'images' as the field name for all files
//       } else {
//         console.warn("An item in imageFiles was not a File object:", file);
//       }
//     });
//   }

//   try {
//     const response = await apiClientRewards.post('/submissions', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//       onUploadProgress: (progressEvent) => {
//         let percentCompleted = 0;
//         if (progressEvent.total) { // progressEvent.total might be undefined initially
//             percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//         } else if (progressEvent.loaded > 0 && imageFiles.length > 0) {
//             // Fallback if total is not available (e.g. chunked transfer encoding with no Content-Length)
//             // This is a rough estimate, assumes all files are roughly same size after first progress.
//             const assumedTotal = progressEvent.loaded / (imageFiles.findIndex(f => f.size === progressEvent.loaded) + 1) * imageFiles.length;
//             if (assumedTotal > 0) {
//                 percentCompleted = Math.min(100, Math.round((progressEvent.loaded * 100) / assumedTotal));
//             }
//         }
        
//         if (onUploadProgressCallback) {
//           onUploadProgressCallback(percentCompleted > 0 ? percentCompleted : -1); // -1 for indeterminate
//         }
//       },
//       // After upload completes, signal processing has started (from client's perspective)
//       // This is not a true server-side "processing started" event
//       transformRequest: [(data, headers) => {
//         if (onProcessingStartCallback) {
//             onProcessingStartCallback();
//         }
//         return data;
//       }],
//     });
//     return response.data; // Contains { message, submissionId, serviceDataId }
//   } catch (error) {
//     // Errors are handled by the interceptor, just re-throw to propagate
//     throw error;
//   }
// };

// // You might have other API functions here for fetching data, etc.
// // export const getMySubmissions = async () => { ... }


// src/services/api.js

import axios from 'axios';
import { toast } from 'sonner';
import tokenService from '../utils/tokenService';

// --- API Service URLs ---
const AUTH_API_URL = import.meta.env.VITE_BACKEND_AUTH_URL ;
const REWARDS_API_URL = import.meta.env.VITE_BACKEND_REWARDS_URL || 'http://localhost:3002/api/rewards';

// --- Axios Clients ---
// Use separate clients for different microservices
const authApiClient = axios.create({
  baseURL: AUTH_API_URL,
  timeout: 15000,
});

const rewardsApiClient = axios.create({
  baseURL: REWARDS_API_URL,
  timeout: 30000,
});

// --- Axios Interceptor Logic ---
const ongoingRequests = new Set();

const setupInterceptors = (apiClient) => {
  apiClient.interceptors.request.use(
    (config) => {
      const token = tokenService.getToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      config.metadata = { startTime: new Date() };
      return config;
    },
    (error) => {
      toast.error('Failed to setup request. Please check your connection.');
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const { status, data } = error.response || {};
      
      // Handle 401 for token refresh
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        if (ongoingRequests.has('token-refresh')) {
          return new Promise(resolve => setTimeout(() => resolve(apiClient(originalRequest)), 1000));
        }
        ongoingRequests.add('token-refresh');
        let refreshToastId = toast.loading('Session expired. Attempting to refresh...');
        try {
          const refreshResult = await tokenService.ensureValidToken();
          if (refreshResult.success) {
            toast.success('Session refreshed.', { id: refreshToastId });
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokenService.getToken()}`;
            originalRequest.headers['Authorization'] = `Bearer ${tokenService.getToken()}`;
            return apiClient(originalRequest);
          } else {
            throw new Error('Automatic token refresh failed.');
          }
        } catch (refreshError) {
          toast.error('Your session has expired. Please login again.', { id: refreshToastId });
          tokenService.clearTokens();
          // Optional: Force redirect
          // window.location.href = '/login';
          return Promise.reject(error);
        } finally {
            ongoingRequests.delete('token-refresh');
        }
      }

      // Handle other common errors
      const errorMessage = data?.message || error.message || 'An unknown error occurred.';
      if (status !== 401) { // Avoid double-toasting 401 errors
        toast.error(errorMessage);
      }
      
      return Promise.reject(error);
    }
  );
};

// Apply interceptors to both clients
setupInterceptors(authApiClient);
setupInterceptors(rewardsApiClient);

// --- EXPORTED API FUNCTIONS ---

/**
 * Submits new service data with images.
 */
export const submitServiceDataApi = async (serviceType, data, imageFiles, onUploadProgressCallback) => {
  const formData = new FormData();
  formData.append('serviceType', serviceType);
  formData.append('data', JSON.stringify(data));
  imageFiles.forEach(file => formData.append('images', file));

  return rewardsApiClient.post('/submissions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 180000, // 3-minute timeout for large uploads
    onUploadProgress: (progressEvent) => {
      if (onUploadProgressCallback && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgressCallback(percentCompleted);
      }
    },
  });
};

/**
 * Fetches the user's submission history from the rewards service.
 * @param {object} params - Pagination and filter parameters.
 */
export const getMySubmissions = (params) => {
    return rewardsApiClient.get('/submissions/me', { params });
};

/**
 * Fetches the user's reward redemption history from the auth service.
 */
export const getMyRedemptions = () => {
    return authApiClient.get('/api/auth/redeemed-rewards');
};

/**
 * Fetches the user's spin wheel win history from the auth service.
 */
export const getMySpinHistory = () => {
    return authApiClient.get('/api/spin/history');
};

/**
 * Fetches the user's profile information from the auth service.
 */
export const getMyProfile = () => {
    return authApiClient.get('/auth/profile');
};

/**
 * Fetches the user's available spin count from the auth service.
 */
export const getSpinStatus = () => {
    return authApiClient.get('/spin/status');
};

/**
 * Consumes one spin and gets the prize from the auth service.
 */
export const consumeSpin = () => {
    return authApiClient.post('/spin/consume');
};

/**
 * Redeems a level-based reward.
 */
export const redeemReward = (levelData) => {
    return authApiClient.post('/auth/redeem-reward', levelData);
};
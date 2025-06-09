
// ========================================================================
// FILE: rewards-service/src/services/auth-api.service.js
// ========================================================================

const axios = require('axios');
const config = require('../config');
const logger = require('../config/logger');
const { StatusCodes } = require('http-status-codes');

const authApiClient = axios.create({
  baseURL: config.AUTH_SERVICE_URL, // e.g., http://localhost:3001
  timeout: 8000,
  headers: {
    'x-internal-api-key': config.INTERNAL_API_KEY,
    'Content-Type': 'application/json',
  },
});

if (!config.INTERNAL_API_KEY) {
    logger.error('[AuthApiService] FATAL: INTERNAL_API_KEY is not configured in rewards-service config.');
} else {
    logger.info(`[AuthApiService] Initialized with INTERNAL_API_KEY (first 5): ${config.INTERNAL_API_KEY.substring(0,5)}...`);
}

const handleApiError = (error, operation, userIdForLog = 'N/A') => {
  let errorMessage = `Auth service request failed for ${operation} for user ${userIdForLog}`;
  let statusCode = StatusCodes.SERVICE_UNAVAILABLE;

  if (error.response) {
    statusCode = error.response.status;
    const responseData = error.response.data;
    const specificMessage = responseData?.message || JSON.stringify(responseData) || error.response.statusText;
    logger.error(`[AuthApiService] Error during ${operation} for user ${userIdForLog} (${statusCode}): ${specificMessage}`, { responseData, requestConfig: error.config });
    errorMessage += `: ${specificMessage} (Status: ${statusCode})`;
  } else if (error.request) {
    logger.error(`[AuthApiService] No Response during ${operation} for user ${userIdForLog}. Is auth-service running at ${config.AUTH_SERVICE_URL}? Error: ${error.message}`);
    errorMessage += `: No response from auth service. Ensure it's running.`;
    if (error.code === 'ECONNABORTED') statusCode = StatusCodes.REQUEST_TIMEOUT;
  } else {
    logger.error(`[AuthApiService] Axios Setup Error during ${operation} for user ${userIdForLog}: ${error.message}`);
    errorMessage += `: Error setting up request - ${error.message}`;
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }
  const customError = new Error(errorMessage);
  customError.statusCode = statusCode;
  customError.details = error.response?.data;
  customError.originalError = error;
  throw customError;
};

const incrementSubmittedCount = async (userId) => {
  if (!userId) throw new Error('UserID is required for incrementSubmittedCount');
  try {
    logger.debug(`[AuthApiService] Calling incrementSubmittedCount for user ${userId} at ${config.AUTH_SERVICE_URL}/internal/users/${userId}/stats/increment-submitted`);
    const response = await authApiClient.post(`/internal/users/${userId}/stats/increment-submitted`);
    logger.info(`[AuthApiService] Successfully called incrementSubmittedCount for user ${userId}. Response:`, response.data);
    return response.data;
  } catch (error) {
    handleApiError(error, 'incrementSubmittedCount', userId);
  }
};

const incrementVerifiedCount = async (userId) => {
  if (!userId) throw new Error('UserID is required for incrementVerifiedCount');
  try {
    const response = await authApiClient.post(`/internal/users/${userId}/stats/increment-verified`);
    logger.info(`[AuthApiService] Successfully called incrementVerifiedCount for user ${userId}.`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'incrementVerifiedCount', userId);
  }
};

const incrementRejectedCount = async (userId) => {
   if (!userId) throw new Error('UserID is required for incrementRejectedCount');
  try {
    const response = await authApiClient.post(`/internal/users/${userId}/stats/increment-rejected`);
    logger.info(`[AuthApiService] Successfully called incrementRejectedCount for user ${userId}.`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'incrementRejectedCount', userId);
  }
};

// 🌟 NEW METHOD: Generic method to increment submission stats
const incrementSubmissionStats = async (userId, statType) => {
  if (!userId) throw new Error('UserID is required for incrementSubmissionStats');
  if (!statType) throw new Error('StatType is required for incrementSubmissionStats');
  
  try {
    let endpoint;
    switch (statType.toLowerCase()) {
      case 'submitted':
        endpoint = `/internal/users/${userId}/stats/increment-submitted`;
        break;
      case 'verified':
        endpoint = `/internal/users/${userId}/stats/increment-verified`;
        break;
      case 'rejected':
        endpoint = `/internal/users/${userId}/stats/increment-rejected`;
        break;
      default:
        throw new Error(`Invalid statType: ${statType}. Must be 'submitted', 'verified', or 'rejected'`);
    }
    
    logger.debug(`[AuthApiService] Calling incrementSubmissionStats for user ${userId}, statType: ${statType} at ${config.AUTH_SERVICE_URL}${endpoint}`);
    const response = await authApiClient.post(endpoint);
    logger.info(`[AuthApiService] Successfully called incrementSubmissionStats for user ${userId}, statType: ${statType}.`);
    return response.data;
  } catch (error) {
    handleApiError(error, `incrementSubmissionStats (${statType})`, userId);
  }
};

const awardCoins = async (userId, amount, reasonContext = 'Submission reward') => {
  if (!userId || typeof amount !== 'number') throw new Error('UserID and a valid amount are required for awardCoins');
  try {
    logger.debug(`[AuthApiService] Calling awardCoins for user ${userId}, amount: ${amount} at ${config.AUTH_SERVICE_URL}/internal/users/${userId}/coins/update`);
    const response = await authApiClient.post(`/internal/users/${userId}/coins/update`, {
      amount,
      reason: reasonContext,
    });
    logger.info(`[AuthApiService] Successfully called awardCoins for user ${userId}. Amount: ${amount}.`);
    return response.data;
  } catch (error) {
    handleApiError(error, `awardCoins (amount: ${amount})`, userId);
  }
};

const getUserDetails = async (userId) => {
  if (!userId) return null;
  try {
    const response = await authApiClient.get(`/internal/users/${userId}/details`);
    logger.info(`[AuthApiService] Successfully fetched user details for ${userId}.`);
    return response.data;
  } catch (error) {
    logger.error(`[AuthApiService] Error fetching user details for ${userId}:`, error.message);
    return null; // Return null so the calling function can proceed gracefully
  }
};


const grantSpin = async (userId) => {
  if (!userId) throw new Error('UserID is required for grantSpin');
  try {
      logger.debug(`[AuthApiService] Calling grantSpin for user ${userId}`);
      const response = await authApiClient.post(`/internal/users/${userId}/grant-spin`);
      logger.info(`[AuthApiService] Successfully called grantSpin for user ${userId}.`);
      return response.data;
  } catch (error) {
      // Use your existing handleApiError function
      handleApiError(error, 'grantSpin', userId);
  }
};

module.exports = {
  incrementSubmittedCount,
  incrementVerifiedCount,
  incrementRejectedCount,
  incrementSubmissionStats, // 🌟 NEW METHOD
  awardCoins,
  getUserDetails,
  grantSpin,
};
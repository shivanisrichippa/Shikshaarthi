// rewards-service/src/services/coin-calculator.service.js (COMPLETE AND CORRECTED)

// Central configuration for submission rewards.
const COIN_ALLOCATIONS = {
  rental: 20,
  mess: 15,
  plumber: 15,
  electrician: 15,
  laundry: 15,
  medical: 10,
  // NOTE: A default of 0 is returned for any unlisted service type.
};

/**
 * Calculates the number of coins to be awarded for a given service type.
 * @param {string} serviceType - The type of the service (e.g., 'rental', 'mess').
 * @returns {number} The number of coins to award, or 0 if the service type is not found.
 */
const calculateCoinsForSubmission = (serviceType) => {
  // Return the allocated coins, or 0 if the serviceType doesn't exist in the map.
  return COIN_ALLOCATIONS[serviceType] || 0;
};

module.exports = {
  calculateCoinsForSubmission,
  COIN_ALLOCATIONS, // Exporting the map can be useful for other parts of the app, like displaying potential rewards.
};
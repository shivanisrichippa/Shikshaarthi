
// auth-service/src/config/index.js
const path = require('path');

const env = process.env.NODE_ENV || 'development';
// Construct path relative to this config file's directory
const envPath = path.resolve(__dirname, 'env', `${env}.env`);


// Ensure dotenv is loaded before this module is fully parsed by other files
// by any other files that might `require` this config.
const dotenvResult = require('dotenv').config({ path: envPath });

if (dotenvResult.error) {
  console.warn(`[AuthService Config] Error loading .env file from ${envPath}: ${dotenvResult.error.message}. Relying on preset environment variables if available.`);
}


const requiredVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'AUTH_MONGO_URI',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'INTERNAL_API_KEY', // Crucial for inter-service communication
  'AUTH_MONGO_URI',
  'INITIAL_ADMIN_EMAIL',
  'INITIAL_ADMIN_PASSWORD'

];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('[AuthService Config] FATAL: Missing required environment variables:', missingVars.join(', '));
  if (env === 'production' || process.env.CI) { // Exit in prod or CI if critical vars are missing
    process.exit(1);
  } else {
    console.warn("[AuthService Config] Development mode: Will proceed despite missing vars, but functionality may be impaired.");
  }
}

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h', // Access token expiry
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // Refresh token expiry

  AUTH_MONGO_URI: process.env.AUTH_MONGO_URI,
  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY, // For internal service communication

  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  INITIAL_ADMIN_EMAIL: process.env.INITIAL_ADMIN_EMAIL || 'shivanisrichippa@gmail.com',
  INITIAL_ADMIN_PASSWORD: process.env.INITIAL_ADMIN_PASSWORD || '123456789',

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  PORT: process.env.PORT || 3001,
  NODE_ENV: env,
  SERVICE_NAME: process.env.SERVICE_NAME || 'auth-service',

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || (15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,

  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173', // Default for local dev

  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,

  // Supercoin related (defaults, can be overridden by env)
  COINS_LOGIN_BONUS: parseInt(process.env.COINS_LOGIN_BONUS, 10) || 50,
  COINS_RENTAL_ROOM: parseInt(process.env.COINS_RENTAL_ROOM, 10) || 20,
  COINS_MESS_SERVICE: parseInt(process.env.COINS_MESS_SERVICE, 10) || 15,
  COINS_HEALTHCARE_SERVICE: parseInt(process.env.COINS_HEALTHCARE_SERVICE, 10) || 10,
  COINS_HOUSEHOLD_SERVICE: parseInt(process.env.COINS_HOUSEHOLD_SERVICE, 10) || 15,
};
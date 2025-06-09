const path = require('path');
const dotenv = require('dotenv');

// Determine the environment
const env = process.env.NODE_ENV || 'development';

// Option 2: Original path (rewards-service/src/config/env/development.env)
const envSpecificFilePath = path.resolve(__dirname, 'env', `${env}.env`);
const dotenvResult = dotenv.config({ path: envSpecificFilePath });

// Initialize logger early if needed, or use console for pre-logger messages
const prelimLogger = { // Basic logger before full logger is initialized
  info: (msg) => console.log(`[PRELIM INFO] ${msg}`),
  warn: (msg) => console.warn(`[PRELIM WARN] ${msg}`),
  error: (msg) => console.error(`[PRELIM ERROR] ${msg}`),
};

if (dotenvResult.error) {
  prelimLogger.warn(`Could not load .env file from ${envSpecificFilePath}. Relying on global environment variables. Error: ${dotenvResult.error.message}`);
} else if (!dotenvResult.parsed || Object.keys(dotenvResult.parsed).length === 0) {
  prelimLogger.warn(`Loaded .env file from ${envSpecificFilePath}, but it was empty or contained no valid key-value pairs.`);
} else {
  prelimLogger.info(`Successfully loaded environment variables from ${envSpecificFilePath}`);
}

const commonConfig = {
  PORT: process.env.PORT || 3002,
  NODE_ENV: env, // Store resolved NODE_ENV
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  SERVICE_NAME: process.env.SERVICE_NAME || 'Rewards Service',
  SERVICE_URL: process.env.SERVICE_URL || 'http://localhost:3002',
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },
  DB_URIS: {
    rewards: process.env.REWARDS_DB_URI,
    mess: process.env.MESS_DB_URI,
    rental: process.env.RENTAL_DB_URI,
    plumber: process.env.PLUMBER_DB_URI,
    electrician: process.env.ELECTRICIAN_DB_URI,
    laundry: process.env.LAUNDRY_DB_URI,
    medical: process.env.MEDICAL_DB_URI,
    auth: process.env.AUTH_DB_URI, // Added auth DB URI for consistency

  },
  KAFKA_BROKERS: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID || 'rewards-service',
  KAFKA_SUBMISSION_TOPIC: process.env.KAFKA_SUBMISSION_TOPIC || 'submission_events',
};

const developmentConfig = {
  ...commonConfig,
  LOG_LEVEL: 'debug',
};

const productionConfig = {
  ...commonConfig,
  LOG_LEVEL: 'info',
};

const config = env === 'production' ? productionConfig : developmentConfig;

// Validate essential configuration
const requiredConfig = [
  'PORT', 'JWT_SECRET', 'AUTH_SERVICE_URL', 'INTERNAL_API_KEY',
  'CLOUDINARY.CLOUD_NAME', 'CLOUDINARY.API_KEY', 'CLOUDINARY.API_SECRET',
  'DB_URIS.rewards', 'DB_URIS.mess', 'DB_URIS.rental', 
  'DB_URIS.plumber', 'DB_URIS.electrician', 'DB_URIS.laundry', 'DB_URIS.medical',
  'KAFKA_BROKERS', 'KAFKA_CLIENT_ID', 'KAFKA_SUBMISSION_TOPIC','JWT_EXPIRES_IN', 'JWT_REFRESH_SECRET','JWT_REFRESH_EXPIRES_IN', 'SERVICE_NAME', 'SERVICE_URL'
];

function validateConfig(cfg) {
  for (const key of requiredConfig) {
    const keys = key.split('.');
    let current = cfg;
    let currentPath = '';
    for (const k of keys) {
      currentPath = currentPath ? `${currentPath}.${k}` : k;
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        prelimLogger.error(`FATAL ERROR: Missing required configuration object/key for: ${currentPath}`);
        process.exit(1);
      }
    }
    if (current === undefined || current === null || current === '') {
        prelimLogger.error(`FATAL ERROR: Missing value for required configuration: ${key}`);
        process.exit(1);
    }
  }
}

validateConfig(config);

Object.keys(config.DB_URIS).forEach(dbKey => {
    if (!config.DB_URIS[dbKey]) {
        prelimLogger.warn(`WARN: Service-specific DB URI for "${dbKey}" is not set. Corresponding service might not function fully.`);
    }
});

// Initialize logger AFTER config is validated and ready
const logger = require('./logger');
const { JWT_EXPIRES_IN } = require('../../../auth-service/src/config');

// Log a few critical config values to confirm they are loaded (AFTER logger is available)
logger.info(`[CONFIG CHECK] Running in ${config.NODE_ENV} mode.`);
logger.info(`[CONFIG CHECK] PORT: ${config.PORT}`);
logger.info(`[CONFIG CHECK] CLOUDINARY_CLOUD_NAME: ${config.CLOUDINARY.CLOUD_NAME ? 'SET (******)' : 'NOT SET'}`);
logger.info(`[CONFIG CHECK] CLOUDINARY_API_KEY: ${config.CLOUDINARY.API_KEY ? 'SET (******)' : 'NOT SET'}`);
logger.info(`[CONFIG CHECK] REWARDS_DB_URI: ${config.DB_URIS.rewards ? config.DB_URIS.rewards.substring(0,30) + '...' : 'NOT SET'}`);

module.exports = config;
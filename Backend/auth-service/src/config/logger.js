// auth-service/src/config/logger.js

// Simple console-based logger (no external dependencies)
const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`, meta);
  },
  
  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`, meta);
  },
  
  error: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, meta);
  },
  
  debug: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug') {
      console.log(`[${timestamp}] DEBUG: ${message}`, meta);
    }
  }
};

module.exports = logger;
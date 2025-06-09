// config/logger.js - Simple fix (Approach 2)
const winston = require('winston');

// Get log level from environment directly, avoiding circular dependency
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = NODE_ENV === 'production' ? 'info' : 'debug';

const { format, transports } = winston;
const { combine, timestamp, printf, colorize, errors } = format;

const logFormat = printf(({ level, message, timestamp: ts, stack, reqId, ...metadata }) => {
    let log = `${ts} ${level}:`;
    if (reqId) log += ` [${reqId}]`; // Add reqId if present
    log += ` ${stack || message}`;
    // Add any additional metadata if needed
    const metaString = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
    if (metaString && metaString !== '{}') {
         log += ` ${metaString}`;
    }
    return log;
});

console.log(`[Logger Setup] Initializing logger with level: ${LOG_LEVEL} (NODE_ENV: ${NODE_ENV})`);

const logger = winston.createLogger({
    level: LOG_LEVEL,
    format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        errors({ stack: true }), // Log the full stack trace for errors
        logFormat
    ),
    transports: [
        new transports.Console(),
        // Future: Add file transports for production
        // new transports.File({ filename: 'error.log', level: 'error' }),
        // new transports.File({ filename: 'combined.log' }),
    ],
    exceptionHandlers: [ // Catch unhandled exceptions
        new transports.Console(),
        // new transports.File({ filename: 'exceptions.log' })
    ],
    rejectionHandlers: [ // Catch unhandled promise rejections
        new transports.Console(),
        // new transports.File({ filename: 'rejections.log' })
    ]
});

logger.info(`[Logger Setup] Winston logger initialized successfully. Level: ${logger.level}`);

module.exports = logger;
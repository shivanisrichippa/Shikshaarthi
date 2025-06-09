//rewards-service/src/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = 'morgan'; 
const config = require('./config');
const logger = require('./config/logger');
const { connectAllDBs, getDbConnection } = require('./config/db'); // Import getDbConnection
const apiRoutes = require('./routes');
const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose'); // Ensure mongoose is imported
const internalRoutes = require('./routes/internal.routes'); 

// Correct morgan import
const morganLogger = require('morgan');


const app = express();

// Setup DB Connections
connectAllDBs().then(() => {
    logger.info('All database connection attempts initiated.');
    const rewardsDb = getDbConnection('rewards');
    if (!rewardsDb) {
        logger.error("FATAL: Rewards DB not connected. Application might not work correctly.");
        // Consider exiting if rewardsDb is critical: process.exit(1);
    } else {
        logger.info('Rewards DB is connected. Models should be available.');
    }
}).catch(err => {
    logger.error('Failed to initiate database connections:', err);
    process.exit(1);
});


// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.NODE_ENV === 'development') {
  app.use(morganLogger('dev')); // Use the imported morgan
} else {
  app.use(morganLogger('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// API Routes
app.use('/', apiRoutes);
app.use('/internal', internalRoutes); // e.g., /internal/notify-redemption

// Global Error Handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error('Global error handler caught an error:', { 
    message: err.message, 
    stack: err.stack, 
    statusCode: err.statusCode,
    name: err.name
  });
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'An unexpected error occurred.';
  res.status(statusCode).json({
    message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Handle 404 Not Found
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({ message: 'API endpoint not found.' });
});

// In rewards-service/src/config/index.js (or wherever config is loaded)
console.log('[REWARDS-SERVICE DEBUG] JWT_SECRET:', process.env.JWT_SECRET ? `${process.env.JWT_SECRET.substring(0, 10)}...` : 'NOT SET');
console.log('[REWARDS-SERVICE DEBUG] JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);


const server = app.listen(config.PORT, () => {
  logger.info(`Rewards Service listening on port ${config.PORT} in ${config.NODE_ENV} mode`);
});

// Increase server timeout (e.g., to 5 minutes = 300,000 ms)
// This should be longer than any expected operation and frontend timeouts.
const newTimeout = 300000; // 5 minutes
server.setTimeout(newTimeout);
logger.info(`Server timeout set to ${newTimeout / 1000} seconds.`);


// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach(signal => {
  process.on(signal, () => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      // Disconnect all Mongoose connections created with createConnection
      Promise.all(Object.values(mongoose.connections).map(connection => {
        if (connection.readyState === 1) { // Check if connected or connecting
            return connection.close().then(() => {
                logger.info(`MongoDB connection ${connection.name || connection.id} closed.`);
            }).catch(err => {
                logger.error(`Error closing MongoDB connection ${connection.name || connection.id}:`, err);
            });
        }
        return Promise.resolve();
      })).then(() => {
        logger.info('All possible MongoDB connections closed attempt finished.');
        process.exit(0);
      }).catch(err => {
        logger.error('Error during bulk MongoDB connection closing:', err);
        process.exit(1);
      });
    });
  });
});

module.exports = app;
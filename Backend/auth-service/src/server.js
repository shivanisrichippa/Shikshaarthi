
// ========================================================================
// FILE: auth-service/src/server.js (CORRECTED)
// ========================================================================

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'config', 'env', `${process.env.NODE_ENV || 'development'}.env`) });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = 'helmet'; // Corrected: require('helmet');
const morganLogger = require('morgan');

const apiRoutes = require('./routes/api');
const internalRoutes = require('./routes/internal.routes');
const errorHandler = require('../../shared/errors/error-handler');
const config = require('./config');
const logger = require('./config/logger');

// Mongoose connection options (moved here for clarity)
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 20,
  minPoolSize: 5,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true
};

const connectWithRetry = () => {
  logger.info(`[AuthService] Attempting to connect to MongoDB for ${config.SERVICE_NAME}...`);
  logger.info(`URI: ${config.AUTH_MONGO_URI.replace(/:([^:]+)@/, ':****@')}`);
  
  mongoose.connect(config.AUTH_MONGO_URI, mongooseOptions)
    .then(() => {
      logger.info(`[AuthService] MongoDB connection established successfully for ${config.SERVICE_NAME}.`);
    })
    .catch(err => {
      logger.error(`[AuthService] MongoDB connection error: ${err.message}. Retrying in 5 seconds...`);
      setTimeout(connectWithRetry, 5000);
    });
};

// Start the connection process immediately
connectWithRetry();

// --- Mongoose Event Listeners for Robustness ---
mongoose.connection.on('connected', () => {
  logger.info(`[AuthService] Mongoose connected to DB.`);
});

mongoose.connection.on('error', (err) => {
  logger.error(`[AuthService] Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('[AuthService] Mongoose disconnected. Attempting to reconnect...');
  // Mongoose's internal logic will handle reconnection due to the options set.
});

const startServer = () => {
  const app = express();

  app.use(require('helmet')()); // Use helmet correctly
  app.use(cors({ origin:'*' }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  if (config.NODE_ENV === 'development') {
    app.use(morganLogger('dev', { stream: { write: message => logger.debug(message.trim()) } }));
  } else {
    app.use(morganLogger('short', { stream: { write: message => logger.info(message.trim()) } }));
  }
  
  app.get('/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    const isHealthy = dbState === 1;
    res.status(isHealthy ? 200 : 503).json({ 
      status: isHealthy ? 'ok' : 'unhealthy', 
      service: config.SERVICE_NAME,
      timestamp: new Date().toISOString(),
      database: dbStatusMap[dbState] || 'unknown'
    });
  });

  // Middleware to ensure DB is connected before handling requests
  app.use((req, res, next) => {
    if (mongoose.connection.readyState === 1) {
      return next();
    }
    logger.warn(`[AuthService] Delaying request ${req.method} ${req.path} because DB is not connected (state: ${mongoose.connection.readyState}).`);
    res.status(503).json({ message: 'Service is temporarily unavailable, database is reconnecting.' });
  });

  app.use('/internal', internalRoutes);
  app.use('/api', apiRoutes);

  app.use((req, res) => {
    logger.warn(`[AuthService] Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Auth service route not found' });
  });

  app.use(errorHandler);

  const port = config.PORT || 3001;
  const server = app.listen(port, () => {
    logger.info(`[AuthService] ${config.SERVICE_NAME} running on port ${port} in ${config.NODE_ENV} mode`);
  });

  // Graceful shutdown logic... (your existing code is good)
};

// Wait for the initial connection before starting the server
mongoose.connection.once('open', () => {
    logger.info('[AuthService] MongoDB connection is open. Starting Express server...');
    startServer();
});

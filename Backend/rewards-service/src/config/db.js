//rewards-service/src/config/db.js
const mongoose = require('mongoose');
const config = require('./index');
const logger = require('./logger');

const connections = {};

const connectToDB = async (dbName, uri) => {
  if (!uri) {
    logger.warn(`MongoDB URI for ${dbName} is not defined. Skipping connection.`);
    return null;
  }
  try {
    const connection = await mongoose.createConnection(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info(`Successfully connected to MongoDB: ${dbName}`);
    connections[dbName] = connection;
    return connection;
  } catch (error) {
    logger.error(`MongoDB connection error for ${dbName}: ${error.message}`);
    // Decide if you want to process.exit(1) or let the app run partially
    return null;
  }
};

const connectAllDBs = async () => {
  await connectToDB('rewards', config.DB_URIS.rewards);
  await connectToDB('mess', config.DB_URIS.mess);
  await connectToDB('rental', config.DB_URIS.rental);
  await connectToDB('plumber', config.DB_URIS.plumber);
  await connectToDB('electrician', config.DB_URIS.electrician);
  await connectToDB('laundry', config.DB_URIS.laundry);
  await connectToDB('medical', config.DB_URIS.medical);
  // Add other DBs as needed
};

const getDbConnection = (dbName) => {
  if (!connections[dbName]) {
    logger.error(`Database connection for "${dbName}" not found or not initialized.`);
    // Potentially throw an error or handle gracefully depending on application needs
    // For now, returning null or undefined might be handled by the calling code.
    // Consider if attempting a reconnect or specific error handling is needed here.
    return null; 
  }
  return connections[dbName];
};


module.exports = {
  connectAllDBs,
  getDbConnection,
  connections, // Expose all connections if needed directly
};

// //backend/shared/libs/database/mongo-connector.js - Fixed version
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Create a single connection instance that can be shared across the application
let db = null;
let connectionAttempts = 0;
const MAX_RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_INTERVAL = 5000; // 5 seconds

// Connection options with improved settings
const connectionOptions = {
  serverSelectionTimeoutMS: 30000,    // Longer server selection timeout
  socketTimeoutMS: 45000,             // Close sockets after 45 seconds of inactivity
  maxPoolSize: 20,                    // Maximum pool size
  minPoolSize: 5,                     // Maintain at least 5 connections
  autoIndex: true,                    // Enable auto indexing in development
  connectTimeoutMS: 30000,            // Connection timeout
  heartbeatFrequencyMS: 10000,        // Check server status every 10 seconds
  retryWrites: true,                  // Retry write operations
  retryReads: true                    // Retry read operations
};

// Connection monitoring and reconnection logic
const setupConnectionMonitoring = () => {
  mongoose.connection.on('connected', () => {
    console.log("MongoDB connected successfully");
    connectionAttempts = 0; // Reset connection attempts on successful connection
    db = mongoose.connection.db;
  });

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err.message}`);
    if (!db && connectionAttempts < MAX_RECONNECTION_ATTEMPTS) {
      connectionAttempts++;
      console.log(`Attempting to reconnect (${connectionAttempts}/${MAX_RECONNECTION_ATTEMPTS})...`);
      setTimeout(() => reconnect(), RECONNECTION_INTERVAL);
    }
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    if (connectionAttempts < MAX_RECONNECTION_ATTEMPTS) {
      connectionAttempts++;
      console.log(`Attempting to reconnect (${connectionAttempts}/${MAX_RECONNECTION_ATTEMPTS})...`);
      setTimeout(() => reconnect(), RECONNECTION_INTERVAL);
    }
  });
};

// Reconnection function
const reconnect = async () => {
  if (mongoose.connection.readyState === 0) { // Only reconnect if disconnected
    try {
      // Use the stored connection URI
      await mongoose.connect(process.env.AUTH_MONGO_URI, connectionOptions);
      db = mongoose.connection.db;
      console.log("MongoDB reconnected successfully");
    } catch (err) {
      console.error("Failed to reconnect to MongoDB:", err.message);
    }
  }
};

// Main connection function - FIXED to accept connectionUri parameter
const connectToMongo = async (connectionUri = null, serviceName = 'default') => {
  // Use provided URI or fall back to environment variable
  const mongoUri = connectionUri || process.env.AUTH_MONGO_URI;
  
  if (mongoose.connection.readyState === 1) {
    console.log(`MongoDB already connected for ${serviceName}`);
    return mongoose.connection;
  }

  // Verify the connection string is available
  if (!mongoUri) {
    console.error(`ERROR: MongoDB URI is not defined for ${serviceName}!`);
    throw new Error(`Database connection string is missing for ${serviceName}. Check your .env file.`);
  }

  // Log partial connection string for debugging (without exposing credentials)
  const connectionStringSafe = mongoUri.replace(
    /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
    'mongodb$1://$2:****@'
  );
  console.log(`Attempting to connect to MongoDB for ${serviceName}: ${connectionStringSafe}`);
  

  setupConnectionMonitoring();

  try {
    await mongoose.connect(mongoUri, connectionOptions);
    console.log(`MongoDB connection established for ${serviceName}`);
    db = mongoose.connection.db;
    
    // Verify database access by running a simple command
    const dbStatus = await db.command({ ping: 1 });
    if (dbStatus.ok) {
      console.log(`Database ping successful for ${serviceName}, connection is ready`);
      
      // Log database name and available collections
      const dbName = mongoose.connection.db.databaseName;
      console.log(`Connected to database: ${dbName}`);
      
      try {
        const collections = await db.listCollections().toArray();
        console.log("Available collections:", collections.map(c => c.name));
      } catch (err) {
        console.warn("Could not list collections, but connection is established:", err.message);
      }
    }
    
    return mongoose.connection;
  } catch (err) {
    console.error(`Failed to connect to MongoDB for ${serviceName}:`, err.message);
    if (err.name === 'MongoServerSelectionError') {
      console.error("MongoDB Server Selection Error - This often means network issues or wrong connection string");
      console.error("Please check:");
      console.error("1. MongoDB Atlas IP whitelist (add your current IP)");
      console.error("2. MongoDB Atlas username and password in connection string");
      console.error("3. Network connectivity to MongoDB Atlas");
    }
    throw err; // Re-throw to allow caller to handle the error
  }
};

// Export connection function and getter
module.exports = connectToMongo;
module.exports.default = connectToMongo;
module.exports.getDb = () => db;

// Add helper to check connection status
module.exports.isConnected = () => mongoose.connection.readyState === 1;

// Add a helper to wait for connection to be ready
module.exports.waitForConnection = (timeoutMs = 30000) => {
  return new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1) {
      resolve(mongoose.connection);
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error(`Connection timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    const checkConnection = () => {
      if (mongoose.connection.readyState === 1) {
        clearTimeout(timeout);
        resolve(mongoose.connection);
      } else {
        setTimeout(checkConnection, 100);
      }
    };

    checkConnection();
  });
};

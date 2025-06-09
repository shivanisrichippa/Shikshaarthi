const { getDbConnection } = require('../config/db');
const logger = require('../config/logger');

// Import schemas
const messDataSchema = require('../models/service-schemas/MessData.schema');
const rentalDataSchema = require('../models/service-schemas/RentalData.schema');
const plumberDataSchema = require('../models/service-schemas/PlumberData.schema');
const electricianDataSchema = require('../models/service-schemas/ElectricianData.schema');
const laundryDataSchema = require('../models/service-schemas/LaundryData.schema');
const medicalDataSchema = require('../models/service-schemas/MedicalData.schema');

const serviceSchemaMap = {
  mess: { schema: messDataSchema, dbName: 'mess', modelName: 'MessData' },
  rental: { schema: rentalDataSchema, dbName: 'rental', modelName: 'RentalData' },
  plumber: { schema: plumberDataSchema, dbName: 'plumber', modelName: 'PlumberData' },
  electrician: { schema: electricianDataSchema, dbName: 'electrician', modelName: 'ElectricianData' },
  laundry: { schema: laundryDataSchema, dbName: 'laundry', modelName: 'LaundryData' },
  medical: { schema: medicalDataSchema, dbName: 'medical', modelName: 'MedicalData' },
};

const serviceModelCache = {}; // Cache for initialized models

const getServiceModel = (serviceType) => {
  if (serviceModelCache[serviceType]) {
    return serviceModelCache[serviceType];
  }

  const serviceConfig = serviceSchemaMap[serviceType];
  if (!serviceConfig) {
    logger.error(`No schema configuration found for service type: ${serviceType}`);
    throw new Error(`Invalid service type: ${serviceType}`);
  }

  const dbConnection = getDbConnection(serviceConfig.dbName);
  if (!dbConnection) {
    logger.error(`Database connection for ${serviceConfig.dbName} (service: ${serviceType}) not available when trying to get model.`);
    throw new Error(`Database for service ${serviceType} is not connected.`);
  }

  try {
    // Check if model already exists on the connection to prevent OverwriteModelError
    if (dbConnection.models[serviceConfig.modelName]) {
        serviceModelCache[serviceType] = dbConnection.model(serviceConfig.modelName);
    } else {
        serviceModelCache[serviceType] = dbConnection.model(serviceConfig.modelName, serviceConfig.schema);
    }
  } catch (e) {
      // This catch block might be redundant if the above check works, but good for safety.
      if (e.name === 'OverwriteModelError') {
          logger.warn(`Model ${serviceConfig.modelName} was already compiled for service ${serviceType}. Retrieving existing model.`);
          serviceModelCache[serviceType] = dbConnection.model(serviceConfig.modelName);
      } else {
          logger.error(`Error compiling model ${serviceConfig.modelName} for service ${serviceType}:`, e);
          throw e; // Re-throw other critical errors
      }
  }
  return serviceModelCache[serviceType];
};

module.exports = { getServiceModel };
// auth-service/src/utils/seedAdmin.js
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const config = require('../config');
const logger = require('../config/logger');

const seedInitialAdmin = async () => {
  try {
    // Check if any admin already exists
    const existingAdmin = await Admin.findOne({});
    
    if (existingAdmin) {
      logger.info('[AdminSeeder] Initial admin already exists. Skipping seeding.');
      return;
    }

    // Default admin credentials (use environment variables in production)
    const initialAdminEmail = config.INITIAL_ADMIN_EMAIL || 'shivanisrichippa@gmail.com';
    const initialAdminPassword = config.INITIAL_ADMIN_PASSWORD || '123456789';

    // Create the initial admin
    const initialAdmin = new Admin({
      email: initialAdminEmail,
      password: initialAdminPassword,
    });

    await initialAdmin.save();
    logger.info(`[AdminSeeder] Initial admin created successfully: ${initialAdminEmail}`);
    
  } catch (error) {
    logger.error('[AdminSeeder] Error creating initial admin:', {
      message: error.message,
      stack: error.stack
    });
    // Don't throw error to prevent server startup failure
    console.error('Failed to seed initial admin, but continuing server startup...');
  }
};

module.exports = { seedInitialAdmin };
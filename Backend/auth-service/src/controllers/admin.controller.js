// auth-service/src/controllers/admin.controller.js
const Admin = require('../models/Admin');
const User = require('../models/User');
const TokenService = require('../services/token.service');
const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');
const config = require('../config');
const mongoose = require('mongoose');
const emailService = require('../services/email.service');
/**
 * @desc   Login for an administrator
 * @route  POST /api/admin/login
 * @access Public
 */
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const reqId = req.id || Date.now().toString(36);

  logger.info(`[AdminCtrl-${reqId}] Admin login attempt for email: ${email}`);

  if (!email || !password) {
    logger.warn(`[AdminCtrl-${reqId}] Admin login failed: Email or password missing.`);
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Email and password are required."
    });
  }

  try {
    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

    if (!admin) {
      logger.warn(`[AdminCtrl-${reqId}] Admin login failed: Admin email not found - ${email.toLowerCase()}`);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Invalid credentials or unauthorized access."
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      logger.warn(`[AdminCtrl-${reqId}] Admin login failed: Invalid password for - ${email.toLowerCase()}`);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Invalid credentials or password mismatch."
      });
    }

    const tokenPayload = {
      userId: admin._id.toString(),
      email: admin.email,
      role: 'admin',
    };
    const tokens = TokenService.generateTokenPair(tokenPayload);

    logger.info(`[AdminCtrl-${reqId}] Admin login successful: ${admin.email}`);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Admin login successful',
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: admin._id.toString(),
        email: admin.email,
        fullName: 'Administrator',
        role: 'admin',
      },
    });

  } catch (error) {
    logger.error(`[AdminCtrl-${reqId}] Admin Login Error:`, { message: error.message, stack: error.stack, email });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An internal error occurred during admin login."
    });
  }
};

/**
 * @desc   Create a new admin user
 * @route  POST /api/admin/create
 * @access Private/Admin
 */
exports.createAdmin = async (req, res) => {
  const { email, password } = req.body;
  const reqId = req.id || Date.now().toString(36);
  const creatingAdminEmail = req.user?.email || 'UnknownAdmin';

  logger.info(`[AdminCtrl-${reqId}] Admin creation attempt: New admin email ${email} by ${creatingAdminEmail}`);

  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Email and password are required for new admin."
    });
  }
  if (password.length < 8) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "New admin password must be at least 8 characters long."
    });
  }

  try {
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      logger.warn(`[AdminCtrl-${reqId}] Admin creation failed: Email ${email.toLowerCase()} already exists.`);
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: "An admin account with this email already exists."
      });
    }

    const newAdmin = new Admin({
      email: email.toLowerCase(),
      password: password,
    });
    await newAdmin.save();

    logger.info(`[AdminCtrl-${reqId}] New admin account created successfully: ${newAdmin.email} by ${creatingAdminEmail}.`);
    
    const adminResponseData = {
      id: newAdmin._id.toString(),
      email: newAdmin.email,
      createdAt: newAdmin.createdAt
    };

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Admin account created successfully.",
      admin: adminResponseData,
    });

  } catch (error) {
    logger.error(`[AdminCtrl-${reqId}] Create Admin Error:`, { message: error.message, stack: error.stack, email });
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Validation failed while creating admin.",
        errors: error.errors
      });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create admin account due to an internal error."
    });
  }
};

/**
 * @desc   Get all users with pagination and filtering
 * @route  GET /api/admin/users
 * @access Private/Admin
 */
exports.getAllUsers = async (req, res) => {
  const reqId = req.id || Date.now().toString(36);
  logger.info(`[AdminCtrl-${reqId}] Attempting to fetch all users by admin: ${req.user.email}`);
  
  try {
    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Filtering parameters
    const { role, status, verified, search } = req.query;
    let filterQuery = { deleted: { $ne: true } };

    // Apply filters
    if (role && role !== 'ALL') {
      filterQuery.role = role;
    }
    if (status && status !== 'ALL') {
      filterQuery.isActive = status === 'ACTIVE';
    }
    if (verified && verified !== 'ALL') {
      filterQuery.emailVerified = verified === 'VERIFIED';
    }
    if (search && search.trim()) {
      filterQuery.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const usersQuery = User.find(filterQuery)
      .select('-password') // Always exclude password
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);
    
    const users = await usersQuery.lean();
    const totalUsers = await User.countDocuments(filterQuery);

    // Transform users data to match frontend expectations
    const transformedUsers = users.map(user => ({
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      contact: user.contact,
      collegeName: user.collegeName,
      district: user.district,
      tehsil: user.tehsil,
      pincode: user.pincode,
      subscriptionStatus: user.subscriptionStatus || 'none',
      coins: user.coins || 0,
      role: user.role,
      totalCoinsEarned: user.coins || 0, // This might need adjustment based on your coin transaction logic
      totalCoinsSpent: 0, // This might need adjustment based on your coin transaction logic
      lastLogin: user.lastLoginAt,
      loginCount: user.loginCount || 0,
      isActive: user.isActive,
      isVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      coinTransactions: [] // This would need to be populated from a transactions collection if you have one
    }));

    logger.info(`[AdminCtrl-${reqId}] Successfully fetched ${users.length} users (page ${page}). Total: ${totalUsers}`);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Users fetched successfully.",
      data: transformedUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit
      }
    });
  } catch (error) {
    logger.error(`[AdminCtrl-${reqId}] Error fetching all users:`, { message: error.message, stack: error.stack });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch users."
    });
  }
};

/**
 * @desc   Get a specific user by ID
 * @route  GET /api/admin/users/:userId
 * @access Private/Admin
 */
exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  const reqId = req.id || Date.now().toString(36);
  
  logger.info(`[AdminCtrl-${reqId}] Fetching user details for ID: ${userId} by admin: ${req.user.email}`);

  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid user ID format."
    });
  }

  try {
    const user = await User.findById(userId)
      .select('-password') // Exclude password
      .lean();

    if (!user || user.deleted) {
      logger.warn(`[AdminCtrl-${reqId}] User not found or deleted: ${userId}`);
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found."
      });
    }

    // Transform user data to match frontend expectations
    const transformedUser = {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      contact: user.contact,
      collegeName: user.collegeName,
      district: user.district,
      tehsil: user.tehsil,
      pincode: user.pincode,
      subscriptionStatus: user.subscriptionStatus || 'none',
      coins: user.coins || 0,
      role: user.role,
      totalCoinsEarned: user.coins || 0, // Adjust based on your coin transaction logic
      totalCoinsSpent: 0, // Adjust based on your coin transaction logic
      lastLogin: user.lastLoginAt,
      loginCount: user.loginCount || 0,
      isActive: user.isActive,
      isVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      coinTransactions: [], // Populate from transactions if available
      submissionStats: user.submissionStats || {
        submittedCount: user.submittedCount || 0,
        verifiedCount: user.approvedCount || 0,
        rejectedCount: user.rejectedCount || 0
      }
    };

    logger.info(`[AdminCtrl-${reqId}] Successfully fetched user: ${user.email}`);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User fetched successfully.",
      data: transformedUser
    });

  } catch (error) {
    logger.error(`[AdminCtrl-${reqId}] Error fetching user by ID:`, { message: error.message, stack: error.stack, userId });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch user details."
    });
  }
};

/**
 * @desc   Update a user's information
 * @route  PUT /api/admin/users/:userId
 * @access Private/Admin
 */
exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;
  const reqId = req.id || Date.now().toString(36);
  
  logger.info(`[AdminCtrl-${reqId}] Updating user ${userId} by admin: ${req.user.email}`, { updateData });

  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid user ID format."
    });
  }

  try {
    // Find the user first
    const user = await User.findById(userId);
    if (!user || user.deleted) {
      logger.warn(`[AdminCtrl-${reqId}] User not found or deleted: ${userId}`);
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found."
      });
    }

    // Define allowed fields for update
    const allowedFields = [
      'fullName', 'contact', 'collegeName', 'district', 'tehsil', 'pincode',
      'isActive', 'emailVerified', 'coins', 'subscriptionStatus'
    ];

    // Filter and apply updates
    const filteredUpdates = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        filteredUpdates[key] = updateData[key];
      }
    });

    // Special handling for email verification
    if ('emailVerified' in updateData) {
      filteredUpdates.emailVerified = Boolean(updateData.emailVerified);
    }

    // Special handling for coins - use the model method if available
    if ('coins' in updateData) {
      const coinDifference = updateData.coins - (user.coins || 0);
      if (coinDifference !== 0) {
        await user.updateCoins(coinDifference, `Admin update by ${req.user.email}`);
        delete filteredUpdates.coins; // Remove from direct update since we used the method
      }
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...filteredUpdates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    logger.info(`[AdminCtrl-${reqId}] Successfully updated user: ${user.email}`);
    
    // Transform response data
    const transformedUser = {
      _id: updatedUser._id.toString(),
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      contact: updatedUser.contact,
      collegeName: updatedUser.collegeName,
      district: updatedUser.district,
      tehsil: updatedUser.tehsil,
      pincode: updatedUser.pincode,
      subscriptionStatus: updatedUser.subscriptionStatus || 'none',
      coins: updatedUser.coins || 0,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      isVerified: updatedUser.emailVerified,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User updated successfully.",
      data: transformedUser
    });

  } catch (error) {
    logger.error(`[AdminCtrl-${reqId}] Error updating user:`, { message: error.message, stack: error.stack, userId });
    
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Validation failed while updating user.",
        errors: error.errors
      });
    }
    
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update user."
    });
  }
};

/**
 * @desc   Delete a user (soft delete)
 * @route  DELETE /api/admin/users/:userId
 * @access Private/Admin
 */
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  const reqId = req.id || Date.now().toString(36);
  
  logger.info(`[AdminCtrl-${reqId}] Deleting user ${userId} by admin: ${req.user.email}`);

  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid user ID format."
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user || user.deleted) {
      logger.warn(`[AdminCtrl-${reqId}] User not found or already deleted: ${userId}`);
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found or already deleted."
      });
    }

    // Soft delete
    await User.findByIdAndUpdate(userId, {
      deleted: true,
      deletedAt: new Date(),
      isActive: false
    });

    logger.info(`[AdminCtrl-${reqId}] Successfully soft-deleted user: ${user.email}`);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User deleted successfully."
    });

  } catch (error) {
    logger.error(`[AdminCtrl-${reqId}] Error deleting user:`, { message: error.message, stack: error.stack, userId });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete user."
    });
  }
};

/**
 * @desc   Toggle user status (active/inactive)
 * @route  PATCH /api/admin/users/:userId/toggle-status
 * @access Private/Admin
 */
exports.toggleUserStatus = async (req, res) => {
  const { userId } = req.params;
  const reqId = req.id || Date.now().toString(36);
  
  logger.info(`[AdminCtrl-${reqId}] Toggling status for user ${userId} by admin: ${req.user.email}`);

  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid user ID format."
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user || user.deleted) {
      logger.warn(`[AdminCtrl-${reqId}] User not found or deleted: ${userId}`);
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found."
      });
    }

    const newStatus = !user.isActive;
    await User.findByIdAndUpdate(userId, { 
      isActive: newStatus,
      updatedAt: new Date()
    });

    logger.info(`[AdminCtrl-${reqId}] Successfully toggled user status: ${user.email} - Active: ${newStatus}`);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully.`,
      data: { isActive: newStatus }
    });

  } catch (error) {
    logger.error(`[AdminCtrl-${reqId}] Error toggling user status:`, { message: error.message, stack: error.stack, userId });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to toggle user status."
    });
  }
};

/**
 * @desc   Toggle user verification status
 * @route  PATCH /api/admin/users/:userId/toggle-verification
 * @access Private/Admin
 */
exports.toggleUserVerification = async (req, res) => {
  const { userId } = req.params;
  const reqId = req.id || Date.now().toString(36);
  
  logger.info(`[AdminCtrl-${reqId}] Toggling verification for user ${userId} by admin: ${req.user.email}`);

  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid user ID format."
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user || user.deleted) {
      logger.warn(`[AdminCtrl-${reqId}] User not found or deleted: ${userId}`);
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found."
      });
    }

    const newVerificationStatus = !user.emailVerified;
    await User.findByIdAndUpdate(userId, { 
      emailVerified: newVerificationStatus,
      updatedAt: new Date()
    });

    logger.info(`[AdminCtrl-${reqId}] Successfully toggled user verification: ${user.email} - Verified: ${newVerificationStatus}`);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: `User ${newVerificationStatus ? 'verified' : 'unverified'} successfully.`,
      data: { emailVerified: newVerificationStatus }
    });

  } catch (error) {
    logger.error(`[AdminCtrl-${reqId}] Error toggling user verification:`, { message: error.message, stack: error.stack, userId });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to toggle user verification."
    });
  }
};


/**
 * @desc   Admin sends a reward email to a user
 * @route  POST /api/admin/send-reward-email
 * @access Private (Admin)
 */
exports.sendRewardEmail = async (req, res) => {
  const { to, subject, text, html } = req.body;
  const adminEmail = req.user.email;

  if (!to || !subject || !text) {
      return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Recipient (to), subject, and text body are required.",
      });
  }

  try {
      await emailService.sendEmail({ to, subject, text, html });
      logger.info(`Admin ${adminEmail} successfully sent reward email to ${to}`);
      return res.status(StatusCodes.OK).json({
          success: true,
          message: `Email successfully sent to ${to}.`,
      });
  } catch (error) {
      logger.error(`Admin ${adminEmail} failed to send email to ${to}. Error: ${error.message}`);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Failed to send email due to a server error.",
      });
  }
};
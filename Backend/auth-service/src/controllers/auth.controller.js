
// auth-service/src/controllers/auth.controller.js

// CORE DEPENDENCIES
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const axios = require('axios'); // <-- FIX: IMPORT AXIOS
const { StatusCodes } = require('http-status-codes'); // <-- FIX: IMPORT STATUSCODES


// MODELS
const User = require('../models/User');
const TempUser = require('../models/TempUser');
const PasswordReset = require('../models/PasswordReset');
const OTP = require('../models/OTP');
const RewardRedemption = require('../models/RewardRedemption');
const config = require('../config');
const logger = require('../config/logger'); // <-- FIX: ADD THIS LINE

// SERVICES
const TokenService = require('../services/token.service');
const OTPService = require('../services/otp.service');
const { generateAndSendOTP, verifyOTP } = require('../services/otp.service');

// UTILITIES & ERRORS
const { getDb } = require('../shared/libs/database/mongo-connector'); // This is no longer the primary way we access DB, but we'll leave the import.
const { ApiError, BadRequestError } = require('../shared/errors/api-errors');
const { checkRateLimit } = require('../utils/rateLimit');

// DATA & OTHER CONTROLLERS
const collegesData = require('../scripts/data/maharashtra-colleges.json');
const counterController = require('./counter.controller');

// =============================================================================
// HELPER FUNCTION to check DB connection
// =============================================================================
const isDbConnected = () => {
    return mongoose.connection.readyState === 1;
};

// =============================================================================
// PUBLIC & REGISTRATION ROUTES
// =============================================================================

// Get colleges endpoint
exports.getColleges = async (req, res) => {
    try {
        const { district, college } = req.query;
        if (!district || !college) {
            return res.status(400).json({ error: 'District and college are required' });
        }
        const filteredColleges = collegesData.filter(c =>
            c.district.toLowerCase() === district.toLowerCase() &&
            c.college.toLowerCase().includes(college.toLowerCase())
        );
        res.json(filteredColleges.map(c => c.college));
    } catch (error) {
        console.error('Get colleges error:', error);
        res.status(500).json({ error: 'Failed to fetch colleges' });
    }
};

// College validation endpoint
exports.validateCollege = async (req, res) => {
    try {
        const { collegeName, district } = req.body;
        if (!collegeName || !district) {
            return res.status(400).json({ error: 'College name and district are required' });
        }
        const isValid = collegesData.some(c =>
            c.college.toLowerCase() === collegeName.toLowerCase() &&
            c.district.toLowerCase() === district.toLowerCase()
        );
        res.json({ valid: isValid });
    } catch (error) {
        console.error('Validate college error:', error);
        res.status(500).json({ error: 'Validation failed' });
    }
};

// Check email availability endpoint
exports.checkEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // CORRECTED: Use the active mongoose connection
        if (!isDbConnected()) {
            console.error('Database not connected during email check');
            return res.status(503).json({ error: 'Service temporarily unavailable' });
        }
        const db = mongoose.connection.db;

        const userExists = await db.collection('users').findOne({ email: email.toLowerCase() });
        res.json({
            success: !userExists,
            message: userExists ? 'Email already registered' : 'Email available'
        });
    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({ error: 'Email check failed' });
    }
};

// Send verification OTP for registration
exports.sendVerificationOTP = async (req, res) => {
    try {
        const { email, formData } = req.body;

        if (!email || !formData) {
            return res.status(400).json({ error: 'Email and form data are required' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        const requiredFields = ['fullName', 'password', 'contact', 'collegeName', 'district', 'tehsil', 'pincode'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({ error: 'Missing required fields', details: `Please provide: ${missingFields.join(', ')}` });
        }

        // CORRECTED: Use the active mongoose connection
        if (!isDbConnected()) {
            console.error('Database not initialized during OTP request');
            return res.status(503).json({ error: 'Service temporarily unavailable' });
        }
        const db = mongoose.connection.db;

        const canSendOTP = await checkRateLimit(db, email.toLowerCase(), 'send_otp', 2, 3);
        if (!canSendOTP) {
            return res.status(429).json({ error: 'Too many requests', message: 'Please wait 2 minutes before requesting another verification code' });
        }

        const userExists = await db.collection('users').findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const tempUserData = {
            email: email.toLowerCase(),
            formData: { ...formData, email: email.toLowerCase() },
            status: 'pending_verification',
            otpAttempts: 0,
            createdAt: new Date()
        };

        await db.collection('tempusers').deleteMany({ email: email.toLowerCase(), status: 'pending_verification' });
        const result = await db.collection('tempusers').insertOne(tempUserData);
        tempUserData._id = result.insertedId;

        const otpSent = await OTPService.generateAndSendOTP(email);
        if (!otpSent) {
            await db.collection('tempusers').deleteOne({ _id: tempUserData._id });
            return res.status(500).json({ error: 'Failed to send verification code' });
        }

        return res.status(200).json({ message: 'Verification code sent successfully', tempUserId: tempUserData._id });
    } catch (error) {
        console.error('Unhandled error in sendVerificationOTP:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Verify OTP and complete registration


// Verify OTP and complete registration
exports.verifyOTPAndRegister = async (req, res) => {
    try {
        const { tempUserId, otp } = req.body;
        if (!tempUserId || !otp) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Temporary user ID and verification code are required' });
        }

        if (!isDbConnected()) {
            return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({ error: 'Service temporarily unavailable' });
        }
        
        const db = mongoose.connection.db; // Still needed for tempusers collection
        const tempUser = await db.collection('tempusers').findOne({ _id: new mongoose.Types.ObjectId(tempUserId) });
        if (!tempUser || tempUser.status !== 'pending_verification') {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Verification session not found or expired' });
        }
        if (tempUser.otpAttempts >= 3) {
            await db.collection('tempusers').deleteOne({ _id: tempUser._id });
            return res.status(StatusCodes.TOO_MANY_REQUESTS).json({ error: 'Too many failed attempts' });
        }

        const isValidOTP = await OTPService.verifyOTP(tempUser.email, otp);
        if (!isValidOTP) {
            await db.collection('tempusers').updateOne({ _id: tempUser._id }, { $inc: { otpAttempts: 1 } });
            const attemptsLeft = 3 - (tempUser.otpAttempts + 1);
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid verification code', attemptsLeft });
        }

        // CORRECTED: Use the Mongoose User model to create the new user
        // This ensures schema defaults (like `coins: 50`) and hooks (like the post-save transaction log) are applied.
        const newUser = await User.create({
            fullName: tempUser.formData.fullName,
            email: tempUser.formData.email.toLowerCase(),
            password: tempUser.formData.password, // The pre-save hook will hash this
            contact: tempUser.formData.contact,
            collegeName: tempUser.formData.collegeName,
            district: tempUser.formData.district,
            tehsil: tempUser.formData.tehsil,
            pincode: tempUser.formData.pincode,
            emailVerified: true,
            subscriptionStatus: 'active',
            authProvider: 'email',
            // DO NOT set coins here. Let the schema default handle it.
        });

        const tokenPayload = { userId: newUser._id, email: newUser.email, role: newUser.role };
        const tokens = TokenService.generateTokenPair(tokenPayload);
        
        await db.collection('tempusers').updateOne({ _id: tempUser._id }, { $set: { status: 'completed', completedAt: new Date() } });

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Registration completed successfully. 50 welcome coins awarded!',
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: { 
                id: newUser._id, 
                email: newUser.email, 
                fullName: newUser.fullName, 
                coins: newUser.coins // This will correctly be 50
            }
        });
    } catch (error) {
        logger.error('Verification and registration error:', error);
        if (error.code === 11000) { // Handle duplicate email error from Mongoose
             return res.status(StatusCodes.CONFLICT).json({ error: 'Email already registered.' });
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Registration failed' });
    }
};


// Resend OTP for registration
exports.resendOTP = async (req, res) => {
    try {
        const { email, tempUserId } = req.body;
        if (!email && !tempUserId) {
            return res.status(400).json({ error: 'Email or temporary user ID is required' });
        }

        // CORRECTED: Use the active mongoose connection
        if (!isDbConnected()) {
            return res.status(503).json({ error: 'Service temporarily unavailable' });
        }
        const db = mongoose.connection.db;

        const identifier = email || tempUserId;
        const canResendOTP = await checkRateLimit(db, identifier, 'resend_otp', 1, 2);
        if (!canResendOTP) {
            return res.status(429).json({ error: 'Too many requests' });
        }

        let targetEmail = email;
        if (tempUserId && !email) {
            const tempUser = await db.collection('tempusers').findOne({ _id: new mongoose.Types.ObjectId(tempUserId) });
            if (!tempUser) {
                return res.status(400).json({ error: 'Verification session not found or expired' });
            }
            targetEmail = tempUser.email;
        }

        const otpSent = await OTPService.generateAndSendOTP(targetEmail);
        if (!otpSent) {
            return res.status(500).json({ error: 'Failed to send verification code' });
        }
        res.json({ success: true, message: 'Verification code sent successfully' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ error: 'Failed to resend verification code' });
    }
};

// =============================================================================
// AUTHENTICATION & SESSION MANAGEMENT
// =============================================================================

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }

        // CORRECTED: Use the active mongoose connection
        if (!isDbConnected()) {
            return res.status(503).json({ success: false, error: 'Service temporarily unavailable' });
        }
        const db = mongoose.connection.db;

        const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
        if (!user || user.deleted) {
            return res.status(401).json({ success: false, error: 'Authentication failed' });
        }
        if (user.authProvider === 'google' && !user.password) {
            return res.status(400).json({ success: false, error: 'Invalid login method', message: 'Please use Google sign-in.' });
        }
        if (!user.password) {
            return res.status(401).json({ success: false, error: 'Authentication failed' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, error: 'Authentication failed' });
        }

        const tokenPayload = { userId: user._id.toString(), email: user.email, role: user.role || 'user' };
        const tokens = TokenService.generateTokenPair(tokenPayload);
        const userData = {
            id: user._id.toString(),
            email: user.email,
            fullName: user.fullName,
            coins: user.coins || 0,
            subscriptionStatus: user.subscriptionStatus || 'none',
            role: user.role || 'user',
            profilePicture: user.profilePicture || null,
            contact: user.contact,
            collegeName: user.collegeName,
            district: user.district,
            tehsil: user.tehsil,
            pincode: user.pincode
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Authentication failed' });
    }
};

// Refresh token
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, error: 'Refresh token is required' });
        }
        const decoded = TokenService.verifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(401).json({ success: false, error: 'Invalid refresh token' });
        }

        // CORRECTED: Use the active mongoose connection
        if (!isDbConnected()) {
            return res.status(503).json({ success: false, error: 'Service temporarily unavailable' });
        }
        const db = mongoose.connection.db;

        const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(decoded.userId) });
        if (!user || user.deleted) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const tokenPayload = { userId: user._id.toString(), email: user.email, role: user.role || 'user' };
        const tokens = TokenService.generateTokenPair(tokenPayload);
        const userData = {
            id: user._id.toString(),
            email: user.email,
            fullName: user.fullName,
            coins: user.coins || 0,
            subscriptionStatus: user.subscriptionStatus || 'none',
            role: user.role || 'user',
            profilePicture: user.profilePicture || null,
            contact: user.contact,
            collegeName: user.collegeName,
            district: user.district,
            tehsil: user.tehsil,
            pincode: user.pincode
        };

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
            user: userData
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ success: false, error: 'Failed to refresh token' });
    }
};

// Logout
exports.logout = async (req, res) => {
    try {
        console.log('User logged out');
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, error: 'Logout failed' });
    }
};

// Verify token
exports.verifyToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = TokenService.verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }

        // CORRECTED: Use the active mongoose connection
        if (!isDbConnected()) {
            return res.status(503).json({ success: false, error: 'Service temporarily unavailable' });
        }
        const db = mongoose.connection.db;

        const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(decoded.userId) });
        if (!user || user.deleted) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'Token is valid' });
    } catch (error) {
        console.error('Token verification error:', error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: error.name });
        }
        res.status(500).json({ success: false, error: 'Token verification failed' });
    }
};

// Check authentication status
exports.checkAuth = async (req, res) => {
    // If middleware passed, user is authenticated. req.user is available.
    res.json({ success: true, authenticated: true, userId: req.user.userId });
};

// =============================================================================
// PASSWORD MANAGEMENT
// =============================================================================

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }
        const normalizedEmail = email.toLowerCase().trim();

        // CORRECTED: Use the active mongoose connection
        if (!isDbConnected()) {
            return res.status(503).json({ success: false, error: 'Service temporarily unavailable' });
        }
        const db = mongoose.connection.db;

        const user = await db.collection('users').findOne({ email: normalizedEmail });
        if (!user || user.deleted) {
            return res.status(404).json({ success: false, error: 'This email is not registered.' });
        }

        const tempUserId = crypto.randomBytes(16).toString('hex');
        await db.collection('passwordresets').deleteMany({ email: normalizedEmail });
        const resetRecord = {
            tempUserId,
            email: normalizedEmail,
            userId: user._id,
            isUsed: false,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 15 * 60 * 1000)
        };
        await db.collection('passwordresets').insertOne(resetRecord);
        const otpSent = await generateAndSendOTP(normalizedEmail, 'reset');
        if (!otpSent) {
            return res.status(500).json({ success: false, error: 'Failed to send reset code' });
        }
        res.json({ success: true, message: 'Reset code sent to your email', tempUserId });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, error: 'Failed to send reset code' });
    }
};

// Verify Reset OTP
exports.verifyResetOTP = async (req, res) => {
    try {
        const { tempUserId, email, otp } = req.body;
        if (!tempUserId || !email || !otp) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const isValidOTP = await verifyOTP(normalizedEmail, otp, 'reset');
        if (!isValidOTP) {
            return res.status(400).json({ success: false, error: 'Invalid verification code' });
        }

        // CORRECTED: Use the active mongoose connection
        if (!isDbConnected()) {
            return res.status(503).json({ success: false, error: 'Service temporarily unavailable' });
        }
        const db = mongoose.connection.db;

        const resetRecord = await db.collection('passwordresets').findOne({ tempUserId, email: normalizedEmail, isUsed: false });
        if (!resetRecord) {
            return res.status(404).json({ success: false, error: 'Reset session not found or expired' });
        }

        await db.collection('passwordresets').updateOne({ tempUserId }, { $set: { otpVerified: true, otpVerifiedAt: new Date() } });
        res.json({ success: true, message: 'Code verified successfully', tempUserId });
    } catch (error) {
        console.error('Verify reset OTP error:', error);
        res.status(500).json({ success: false, error: 'Failed to verify code' });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { tempUserId, email, newPassword } = req.body;
        if (!tempUserId || !email || !newPassword) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long' });
        }
        const normalizedEmail = email.toLowerCase().trim();

        // CORRECTED: Use the active mongoose connection
        if (!isDbConnected()) {
            return res.status(503).json({ success: false, error: 'Service temporarily unavailable' });
        }
        const db = mongoose.connection.db;

        const resetRecord = await db.collection('passwordresets').findOne({ tempUserId, email: normalizedEmail, isUsed: false, otpVerified: true });
        if (!resetRecord) {
            return res.status(404).json({ success: false, error: 'Reset session not found or invalid' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await db.collection('users').updateOne({ _id: resetRecord.userId }, { $set: { password: hashedPassword } });
        await db.collection('passwordresets').updateOne({ tempUserId }, { $set: { isUsed: true, usedAt: new Date() } });
        await db.collection('otps').deleteMany({ email: normalizedEmail, type: 'reset' });

        res.json({ success: true, message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, error: 'Password reset failed' });
    }
};

// Resend Reset OTP
exports.resendResetOTP = async (req, res) => {
    try {
        const { tempUserId, email } = req.body;
        if (!tempUserId || !email) {
            return res.status(400).json({ success: false, error: 'Temporary user ID and email are required' });
        }
        const normalizedEmail = email.toLowerCase().trim();

        // CORRECTED: Use the active mongoose connection
        if (!isDbConnected()) {
            return res.status(503).json({ success: false, error: 'Service temporarily unavailable' });
        }
        const db = mongoose.connection.db;
        
        const resetRecord = await db.collection('passwordresets').findOne({ tempUserId, email: normalizedEmail, isUsed: false });
        if (!resetRecord) {
            return res.status(404).json({ success: false, error: 'Reset session not found' });
        }

        const otpSent = await generateAndSendOTP(normalizedEmail, 'reset');
        if (!otpSent) {
            return res.status(500).json({ success: false, error: 'Failed to send reset code' });
        }
        res.json({ success: true, message: 'New reset code sent to your email' });
    } catch (error) {
        console.error('Resend reset OTP error:', error);
        res.status(500).json({ success: false, error: 'Failed to resend reset code' });
    }
};

// Change Password (for logged-in user)
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters long' });
        }

        // CORRECTED: Use the active mongoose connection
        if (!isDbConnected()) {
            return res.status(503).json({ error: 'Service temporarily unavailable' });
        }
        const db = mongoose.connection.db;

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const user = await db.collection('users').findOne({ _id: userObjectId });
        if (!user || user.deleted) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.authProvider === 'google' && !user.password) {
            return res.status(400).json({ error: 'Cannot change password for a Google-authenticated account' });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await db.collection('users').updateOne({ _id: userObjectId }, { $set: { password: hashedPassword, updatedAt: new Date() } });
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};

// =============================================================================
// ENHANCED GET PROFILE WITH COMPLETE TRANSACTION HISTORY
// =============================================================================

/**
 * @desc   Get comprehensive user profile with all transaction history
 * @route  GET /api/auth/profile
 * @access Private
 */
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        if (!isDbConnected()) {
            return res.status(503).json({ error: 'Service temporarily unavailable' });
        }
        
        const db = mongoose.connection.db;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // 1. Get User Profile
        const user = await db.collection('users').findOne({ _id: userObjectId });
        if (!user || user.deleted) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 2. Get Coin Transactions History
        let coinTransactions = [];
        try {
            coinTransactions = await db.collection('coin_transactions')
                .find({ userId: userObjectId })
                .sort({ createdAt: -1 })
                .limit(100)
                .toArray();
        } catch (error) {
            logger.warn(`[getProfile] Could not fetch coin transactions: ${error.message}`);
        }

        // 3. Get Reward Redemptions
        const redeemedRewards = await db.collection('reward_redemptions')
            .find({ userId: userObjectId })
            .sort({ redeemedAt: -1 })
            .toArray();

        // 4. Get Spin History
        let spinHistory = [];
        try {
            spinHistory = await db.collection('spin_history')
                .find({ userId: userObjectId })
                .sort({ spunAt: -1 })
                .limit(50)
                .toArray();
        } catch (error) {
            logger.warn(`[getProfile] Could not fetch spin history: ${error.message}`);
        }

        // 5. Get Data Submissions History
        let submissionsHistory = [];
        try {
            submissionsHistory = await db.collection('data_submissions')
                .find({ userId: userObjectId })
                .sort({ submittedAt: -1 })
                .limit(100)
                .toArray();
        } catch (error) {
            logger.warn(`[getProfile] Could not fetch submissions history: ${error.message}`);
        }

        // 6. Get Password Reset History
        let passwordResets = [];
        try {
            passwordResets = await db.collection('password_resets')
                .find({ userId: userObjectId })
                .sort({ createdAt: -1 })
                .limit(10)
                .toArray();
        } catch (error) {
            logger.warn(`[getProfile] Could not fetch password reset history: ${error.message}`);
        }

        // 7. Get Login History
        let loginHistory = [];
        try {
            loginHistory = await db.collection('login_history')
                .find({ userId: userObjectId })
                .sort({ loginAt: -1 })
                .limit(20)
                .toArray();
        } catch (error) {
            logger.warn(`[getProfile] Could not fetch login history: ${error.message}`);
        }

        // 8. Calculate Advanced Statistics
        const approvedSubmissions = submissionsHistory.filter(s => s.status === 'approved');
        const rejectedSubmissions = submissionsHistory.filter(s => s.status === 'rejected');
        const pendingSubmissions = submissionsHistory.filter(s => s.status === 'pending');

        const totalCoinsEarned = coinTransactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalCoinsSpent = coinTransactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        // 9. Get Recent Activity (Last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentCoinTransactions = coinTransactions.filter(t => new Date(t.createdAt) >= thirtyDaysAgo);
        const recentSubmissions = submissionsHistory.filter(s => new Date(s.submittedAt) >= thirtyDaysAgo);
        const recentSpins = spinHistory.filter(s => new Date(s.spunAt) >= thirtyDaysAgo);

        // 10. Build Comprehensive Response
        const profileResponse = {
            success: true,
            user: {
                // Basic Profile Info
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                contact: user.contact,
                collegeName: user.collegeName,
                district: user.district,
                tehsil: user.tehsil,
                pincode: user.pincode,
                emailVerified: user.emailVerified,
                subscriptionStatus: user.subscriptionStatus,
                profilePicture: user.profilePicture || null,
                role: user.role || 'user',
                
                // Account Status & Dates
                isActive: user.isActive !== false,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastLoginAt: user.lastLoginAt,
                lastSeenAt: user.lastSeenAt,
                
                // Authentication Info
                authProvider: user.authProvider || 'email',
                loginCount: user.loginCount || 0,
                passwordResetCount: user.passwordResetCount || 0,
                lastPasswordResetAt: user.lastPasswordResetAt,
                
                // Coins & Financial Data
                coins: user.coins || 0,
                totalCoinsEarned: totalCoinsEarned || user.totalCoinsEarned || 0,
                totalCoinsSpent: totalCoinsSpent || user.totalCoinsSpent || 0,
                lastCoinsUpdate: user.lastCoinsUpdate,
                availableSpins: user.availableSpins || 0,
                
                // Submission Statistics
                submissionStats: {
                    totalSubmissions: submissionsHistory.length,
                    approvedSubmissions: approvedSubmissions.length,
                    rejectedSubmissions: rejectedSubmissions.length,
                    pendingSubmissions: pendingSubmissions.length,
                    lastSubmissionAt: submissionsHistory[0]?.submittedAt || null,
                    approvalRate: submissionsHistory.length > 0 ? 
                        ((approvedSubmissions.length / submissionsHistory.length) * 100).toFixed(2) : 0
                }
            },
            
            // Complete Transaction History
            transactionHistory: {
                coinTransactions: coinTransactions.map(t => ({
                    id: t._id,
                    type: t.type,
                    amount: t.amount,
                    description: t.description,
                    balanceAfter: t.balanceAfter,
                    createdAt: t.createdAt,
                    metadata: t.metadata || {}
                })),
                
                redeemedRewards: redeemedRewards.map(r => ({
                    id: r._id,
                    levelId: r.levelId,
                    rewardName: r.rewardName,
                    coinsDeducted: r.coinsDeducted,
                    status: r.status,
                    redeemedAt: r.redeemedAt,
                    fulfilledAt: r.fulfilledAt || null
                })),
                
                spinHistory: spinHistory.map(s => ({
                    id: s._id,
                    rewardType: s.rewardType,
                    rewardAmount: s.rewardAmount,
                    spunAt: s.spunAt
                })),
                
                submissionsHistory: submissionsHistory.map(s => ({
                    id: s._id,
                    type: s.type,
                    title: s.title || s.name,
                    status: s.status,
                    coinsEarned: s.coinsEarned || 0,
                    submittedAt: s.submittedAt,
                    reviewedAt: s.reviewedAt || null,
                    rejectionReason: s.rejectionReason || null
                })),
                
                passwordResets: passwordResets.map(p => ({
                    id: p._id,
                    requestedAt: p.createdAt,
                    completedAt: p.completedAt || null,
                    ipAddress: p.ipAddress || null
                })),
                
                loginHistory: loginHistory.map(l => ({
                    id: l._id,
                    loginAt: l.loginAt,
                    ipAddress: l.ipAddress || null,
                    userAgent: l.userAgent || null,
                    successful: l.successful !== false
                }))
            },
            
            // Recent Activity Summary (Last 30 days)
            recentActivity: {
                coinTransactionsCount: recentCoinTransactions.length,
                submissionsCount: recentSubmissions.length,
                spinsCount: recentSpins.length,
                coinsEarnedRecently: recentCoinTransactions
                    .filter(t => t.amount > 0)
                    .reduce((sum, t) => sum + t.amount, 0),
                coinsSpentRecently: recentCoinTransactions
                    .filter(t => t.amount < 0)
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
            },
            
            // Summary Statistics
            summary: {
                memberSince: user.createdAt,
                totalTransactions: coinTransactions.length,
                totalRedemptions: redeemedRewards.length,
                totalSpins: spinHistory.length,
                accountScore: this.calculateAccountScore(user, submissionsHistory, coinTransactions),
                isOnline: this.isUserOnline(user.lastSeenAt)
            }
        };

        // Log successful profile fetch
        logger.info(`[getProfile] Successfully fetched comprehensive profile for user ${user.email}`);
        
        res.json(profileResponse);

    } catch (error) {
        logger.error(`[getProfile] Error fetching profile for user ${req.user.userId}: ${error.message}`, {
            stack: error.stack,
            userId: req.user.userId
        });
        res.status(500).json({ 
            success: false, 
            error: 'Failed to retrieve profile',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// =============================================================================
// NEW: GET DETAILED TRANSACTION HISTORY WITH FILTERS
// =============================================================================

/**
 * @desc   Get paginated transaction history with filters
 * @route  GET /api/auth/transactions
 * @access Private
 */
exports.getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            type = 'all', // 'coins', 'rewards', 'spins', 'submissions', 'all'
            status = 'all', // 'approved', 'rejected', 'pending', 'all'
            page = 1,
            limit = 20,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        if (!isDbConnected()) {
            return res.status(503).json({ error: 'Service temporarily unavailable' });
        }

        const db = mongoose.connection.db;
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = Math.min(parseInt(limit), 100); // Max 100 per page

        // Build date filter
        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        let transactions = [];
        let totalCount = 0;

        // Fetch based on type
        if (type === 'all' || type === 'coins') {
            const coinFilter = { userId: userObjectId };
            if (Object.keys(dateFilter).length > 0) coinFilter.createdAt = dateFilter;

            const coinTransactions = await db.collection('coin_transactions')
                .find(coinFilter)
                .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
                .skip(skip)
                .limit(limitNum)
                .toArray();

            transactions.push(...coinTransactions.map(t => ({
                ...t,
                transactionType: 'coin',
                primaryDate: t.createdAt
            })));
        }

        if (type === 'all' || type === 'submissions') {
            const submissionFilter = { userId: userObjectId };
            if (status !== 'all') submissionFilter.status = status;
            if (Object.keys(dateFilter).length > 0) submissionFilter.submittedAt = dateFilter;

            const submissions = await db.collection('data_submissions')
                .find(submissionFilter)
                .sort({ submittedAt: sortOrder === 'desc' ? -1 : 1 })
                .skip(type === 'submissions' ? skip : 0)
                .limit(type === 'submissions' ? limitNum : 50)
                .toArray();

            transactions.push(...submissions.map(s => ({
                ...s,
                transactionType: 'submission',
                primaryDate: s.submittedAt
            })));
        }

        // Sort all transactions by primary date
        transactions.sort((a, b) => {
            const dateA = new Date(a.primaryDate);
            const dateB = new Date(b.primaryDate);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        // Apply pagination to combined results
        const paginatedTransactions = transactions.slice(0, limitNum);
        totalCount = transactions.length;

        res.json({
            success: true,
            data: {
                transactions: paginatedTransactions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / limitNum),
                    totalCount,
                    hasNext: skip + limitNum < totalCount,
                    hasPrev: parseInt(page) > 1
                },
                filters: {
                    type,
                    status,
                    startDate,
                    endDate,
                    sortBy,
                    sortOrder
                }
            }
        });

    } catch (error) {
        logger.error(`[getTransactionHistory] Error: ${error.message}`, {
            stack: error.stack,
            userId: req.user.userId,
            query: req.query
        });
        res.status(500).json({ 
            success: false, 
            error: 'Failed to retrieve transaction history' 
        });
    }
};

// =============================================================================
// HELPER METHODS
// =============================================================================

/**
 * Calculate user account score based on activity
 */
exports.calculateAccountScore = (user, submissions, coinTransactions) => {
    let score = 0;
    
    // Base score for verified account
    if (user.emailVerified) score += 10;
    
    // Score for submissions
    const approvedSubmissions = submissions.filter(s => s.status === 'approved').length;
    score += approvedSubmissions * 5;
    
    // Score for coin activity
    score += Math.min(coinTransactions.length, 50); // Max 50 points
    
    // Score for account age (days)
    const accountAge = Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
    score += Math.min(accountAge, 100); // Max 100 points
    
    // Score for login frequency
    score += Math.min(user.loginCount || 0, 50); // Max 50 points
    
    return Math.min(score, 1000); // Cap at 1000
};

/**
 * Check if user is currently online
 */
exports.isUserOnline = (lastSeenAt) => {
    if (!lastSeenAt) return false;
    const fiveMinutes = 5 * 60 * 1000;
    return (new Date() - new Date(lastSeenAt)) < fiveMinutes;
};

// =============================================================================
// ANALYTICS ENDPOINTS
// =============================================================================

/**
 * @desc   Get user analytics dashboard
 * @route  GET /api/auth/analytics
 * @access Private
 */
exports.getUserAnalytics = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { period = '30d' } = req.query; // '7d', '30d', '90d', '1y'
        
        if (!isDbConnected()) {
            return res.status(503).json({ error: 'Service temporarily unavailable' });
        }

        const db = mongoose.connection.db;
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        // Calculate date range
        const periodDays = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '1y': 365
        };
        
        const daysBack = periodDays[period] || 30;
        const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

        // Fetch analytics data
        const [coinTransactions, submissions, spins] = await Promise.all([
            db.collection('coin_transactions')
                .find({ userId: userObjectId, createdAt: { $gte: startDate } })
                .sort({ createdAt: 1 })
                .toArray(),
            db.collection('data_submissions')
                .find({ userId: userObjectId, submittedAt: { $gte: startDate } })
                .sort({ submittedAt: 1 })
                .toArray(),
            db.collection('spin_history')
                .find({ userId: userObjectId, spunAt: { $gte: startDate } })
                .sort({ spunAt: 1 })
                .toArray()
        ]);

        // Calculate daily aggregations
        const dailyStats = {};
        
        // Initialize all days in period
        for (let i = 0; i < daysBack; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const dateKey = date.toISOString().split('T')[0];
            dailyStats[dateKey] = {
                date: dateKey,
                coinsEarned: 0,
                coinsSpent: 0,
                submissions: 0,
                spins: 0
            };
        }

        // Aggregate coin transactions
        coinTransactions.forEach(t => {
            const dateKey = new Date(t.createdAt).toISOString().split('T')[0];
            if (dailyStats[dateKey]) {
                if (t.amount > 0) {
                    dailyStats[dateKey].coinsEarned += t.amount;
                } else {
                    dailyStats[dateKey].coinsSpent += Math.abs(t.amount);
                }
            }
        });

        // Aggregate submissions
        submissions.forEach(s => {
            const dateKey = new Date(s.submittedAt).toISOString().split('T')[0];
            if (dailyStats[dateKey]) {
                dailyStats[dateKey].submissions += 1;
            }
        });

        // Aggregate spins
        spins.forEach(s => {
            const dateKey = new Date(s.spunAt).toISOString().split('T')[0];
            if (dailyStats[dateKey]) {
                dailyStats[dateKey].spins += 1;
            }
        });

        const analytics = {
            success: true,
            period,
            startDate,
            endDate: new Date(),
            summary: {
                totalCoinsEarned: coinTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
                totalCoinsSpent: coinTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
                totalSubmissions: submissions.length,
                approvedSubmissions: submissions.filter(s => s.status === 'approved').length,
                totalSpins: spins.length,
                averageDailyActivity: Object.values(dailyStats).reduce((sum, day) => 
                    sum + day.submissions + day.spins, 0) / daysBack
            },
            dailyStats: Object.values(dailyStats),
            topEarningDays: Object.values(dailyStats)
                .sort((a, b) => b.coinsEarned - a.coinsEarned)
                .slice(0, 5),
            submissionBreakdown: {
                approved: submissions.filter(s => s.status === 'approved').length,
                rejected: submissions.filter(s => s.status === 'rejected').length,
                pending: submissions.filter(s => s.status === 'pending').length
            }
        };

        res.json(analytics);

    } catch (error) {
        logger.error(`[getUserAnalytics] Error: ${error.message}`, {
            stack: error.stack,
            userId: req.user.userId
        });
        res.status(500).json({ 
            success: false, 
            error: 'Failed to retrieve user analytics' 
        });
    }
};


// Update User Profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { fullName, contact, collegeName, district, tehsil, pincode } = req.body;
        if (!fullName || !contact) {
            return res.status(400).json({ error: 'Name and contact are required' });
        }

        // CORRECTED: Use the active mongoose connection
        if (!isDbConnected()) {
            return res.status(503).json({ error: 'Service temporarily unavailable' });
        }
        const db = mongoose.connection.db;

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const updateData = { updatedAt: new Date() };
        if (fullName) updateData.fullName = fullName;
        if (contact) updateData.contact = contact;
        if (collegeName) updateData.collegeName = collegeName;
        if (district) updateData.district = district;
        if (tehsil) updateData.tehsil = tehsil;
        if (pincode) updateData.pincode = pincode;

        const result = await db.collection('users').updateOne({ _id: userObjectId }, { $set: updateData });
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Update Profile Picture
exports.updateProfilePicture = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { profilePictureUrl } = req.body;
        if (!profilePictureUrl) {
            return res.status(400).json({ error: 'Profile picture URL is required' });
        }

        // CORRECTED: Use the active mongoose connection
        if (!isDbConnected()) {
            return res.status(503).json({ error: 'Service temporarily unavailable' });
        }
        const db = mongoose.connection.db;

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const result = await db.collection('users').updateOne({ _id: userObjectId }, { $set: { profilePicture: profilePictureUrl, updatedAt: new Date() } });
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true, message: 'Profile picture updated successfully', profilePicture: profilePictureUrl });
    } catch (error) {
        console.error('Update profile picture error:', error);
        res.status(500).json({ error: 'Failed to update profile picture' });
    }
};

// Delete Account (Soft Delete)
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { password } = req.body;
        
        // CORRECTED: Use the active mongoose connection
        if (!isDbConnected()) {
            return res.status(503).json({ error: 'Service temporarily unavailable' });
        }
        const db = mongoose.connection.db;

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const user = await db.collection('users').findOne({ _id: userObjectId });
        if (!user || user.deleted) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.authProvider !== 'google' && user.password) {
            if (!password || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ error: 'Incorrect password' });
            }
        }

        const updateResult = await db.collection('users').updateOne(
            { _id: userObjectId },
            {
                $set: {
                    deleted: true,
                    deletedAt: new Date(),
                    email: `deleted_${user._id}@account.deleted`,
                    fullName: 'Deleted User',
                    contact: null,
                    profilePicture: null,
                    password: null,
                    authProvider: 'deleted',
                    subscriptionStatus: 'cancelled'
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: 'Failed to delete account' });
        }
        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};

// =============================================================================
// REWARDS & COINS
// =============================================================================

// Update User Coins (Likely an internal/admin function)
exports.updateUserCoins = async (req, res) => {
    try {
        const userId = req.user.userId; // Or could be from req.body for admin
        const { coins } = req.body;
        if (typeof coins !== 'number' || coins < 0) {
            return res.status(400).json({ success: false, error: 'Invalid coins amount' });
        }
        
        // CORRECTED: Use the active mongoose connection
        if (!isDbConnected()) {
            return res.status(503).json({ success: false, error: 'Service temporarily unavailable' });
        }
        const db = mongoose.connection.db;

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const result = await db.collection('users').updateOne({ _id: userObjectId }, { $set: { coins: coins, lastCoinsUpdate: new Date() } });
        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, message: 'Coins updated successfully', coins });
    } catch (error) {
        console.error('Update coins error:', error);
        res.status(500).json({ success: false, error: 'Failed to update coins' });
    }
};

/**
 * @desc   User redeems coins for a reward
 * @route  POST /api/auth/redeem-reward
 * @access Private (User)
 */
exports.redeemReward = async (req, res) => {
    const { levelId, coinsToDeduct, rewardName } = req.body;
    const userId = req.user.userId;

    if (!levelId || typeof coinsToDeduct !== 'number' || !rewardName || coinsToDeduct <= 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid reward data provided.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new Error('User not found.');
        }

        if (user.coins < coinsToDeduct) {
            throw new Error(`Insufficient coins. You have ${user.coins}, but need ${coinsToDeduct}.`);
        }

        const existingRedemption = await RewardRedemption.findOne({ userId, levelId }).session(session);
        if (existingRedemption) {
            throw new Error('You have already redeemed the reward for this level.');
        }

        await user.updateCoins(-coinsToDeduct, `Redeemed: ${rewardName}`);

        const newRedemption = new RewardRedemption({
            userId,
            userEmail: user.email,
            userFullName: user.fullName,
            levelId,
            rewardName,
            coinsDeducted: coinsToDeduct, // <-- FIX: Use coinsToDeduct from req.body
            status: 'pending_fulfillment',
        });
        await newRedemption.save({ session });

        await session.commitTransaction();
        logger.info(`[Redeem Reward] User ${userId} successfully redeemed level ${levelId}. Transaction committed.`);

        try {
            const rewardsServiceUrl = config.REWARDS_SERVICE_URL || 'http://localhost:3002';
            await axios.post(`${rewardsServiceUrl}/internal/notify-redemption`, {
                userId: user._id.toString(),
                userFullName: user.fullName,
                userEmail: user.email,
                rewardName,
                levelId,
            }, {
                headers: { 'x-internal-api-key': config.INTERNAL_API_KEY }
            });
            logger.info(`[Redeem Reward] Successfully sent notification to rewards-service for user ${userId}.`);
        } catch (axiosError) {
            logger.error(`[Redeem Reward] NON-CRITICAL: Failed to send notification to rewards-service. Error: ${axiosError.message}`);
        }
        
        res.status(StatusCodes.OK).json({
            success: true,
            message: `Reward "${rewardName}" redeemed successfully!`,
            remainingCoins: user.coins,
        });

    } catch (error) {
        await session.abortTransaction();
        logger.error(`[Redeem Reward] Error for user ${userId}. Transaction aborted. Error: ${error.message}`);
        // Now this line will work because StatusCodes is imported
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

exports.getRedeemedRewards = async (req, res) => {
    try {
        const userId = req.user.userId;
        const redeemedRewards = await RewardRedemption.find({ userId }).sort({ redeemedAt: -1 });
        
        res.json({
            success: true,
            redeemedRewards
        });
    } catch (error) {
        logger.error(`[Get Redeemed] Error for user ${userId}:`, error);
        res.status(500).json({ success: false, error: 'Failed to fetch redeemed rewards' });
    }
};
// =============================================================================
// ADMIN / TESTING
// =============================================================================

// Verify account without OTP (for testing/admin purposes)
exports.verifyAccount = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        // CORRECTED: Use the active mongoose connection
        if (!isDbConnected()) {
            return res.status(503).json({ error: 'Service temporarily unavailable' });
        }
        const db = mongoose.connection.db;

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const result = await db.collection('users').updateOne({ _id: userObjectId }, { $set: { emailVerified: true, updatedAt: new Date() } });
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true, message: 'Account verified successfully' });
    } catch (error) {
        console.error('Verify account error:', error);
        res.status(500).json({ error: 'Failed to verify account' });
    }
};




/**
 * Get user's coin redemption history
 */
exports.getCoinRedemptionHistory = async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Verify the requesting user is admin or the user themselves
      if (req.user.role !== 'admin' && req.user.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own redemption history.'
        });
      }
  
      const RewardRedemption = require('../models/RewardRedemption');
      
      // Fetch redemption history for the user
      const redemptions = await RewardRedemption.find({ userId })
        .sort({ redeemedAt: -1 }) // Most recent first
        .limit(50) // Limit to last 50 redemptions
        .lean();
  
      res.json({
        success: true,
        data: redemptions,
        message: 'Redemption history fetched successfully'
      });
  
    } catch (error) {
      logger.error(`[getCoinRedemptionHistory] Error fetching redemption history for user ${req.params.userId}: ${error.message}`, {
        stack: error.stack,
        userId: req.params.userId
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch redemption history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  































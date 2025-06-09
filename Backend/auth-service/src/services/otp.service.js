// auth-service/src/services/otp.service.js (FIXED VERSION)
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { getDb } = require('../shared/libs/database/mongo-connector');
const config = require('../config');

// OTP collection name
const OTP_COLLECTION = 'otps';

// In-memory OTP storage as a fallback if DB operations fail
const otpCache = new Map();

// Configure nodemailer
let transporter;

try {
  // FIX: Use createTransport instead of createTransporter
  transporter = nodemailer.createTransport({
    service: config.EMAIL_SERVICE || 'gmail',
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASSWORD
    },
    pool: true,
    maxConnections: 5,
    rateDelta: 20000,
    rateLimit: 5
  });

  // Verify email configuration on startup
  transporter.verify((error) => {
    if (error) {
      console.error('Email service configuration error:', error);
    } else {
      console.log('Email service is ready');
    }
  });
} catch (error) {
  console.error('Failed to create email transporter:', error);
}

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via email
 * @param {string} email - Recipient email
 * @param {string} otp - One-time password
 * @param {string} type - OTP type ('verification' or 'reset')
 * @returns {Promise<boolean>} - Success status
 */
const sendOTPEmail = async (email, otp, type = 'verification') => {
  if (!transporter) {
    console.error('Email transporter not configured');
    return false;
  }

  try {
    const isReset = type === 'reset';
    const subject = isReset ? 'Password Reset Code - Shiksharthi' : 'Account Verification Code - Shiksharthi';
    const heading = isReset ? 'Password Reset Request' : 'Account Verification';
    const message = isReset 
      ? 'You have requested to reset your password. Please use the code below:'
      : 'Thank you for registering with Shiksharthi. Please use the verification code below to complete your registration:';

    const mailOptions = {
      from: config.EMAIL_FROM || config.EMAIL_USER || "shiksharthi.company@gmail.com",
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2F8D46; text-align: center; margin-bottom: 30px;">
            ${heading}
          </h2>
          <p style="font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="font-size: 16px; line-height: 1.5;">${message}</p>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 30px 0; border-radius: 5px; border: 2px dashed #2F8D46;">
            <span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #2F8D46;">${otp}</span>
          </div>
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <strong>Important:</strong> This code will expire in 10 minutes. Do not share this code with anyone.
            </p>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you didn't request this ${isReset ? 'password reset' : 'verification'}, please ignore this email or contact our support team.
          </p>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0; font-size: 14px; color: #888;">
              Best regards,<br>
              <strong style="color: #2F8D46;">The Shiksharthi Team</strong>
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
};

/**
 * Store OTP in database with expiration
 * @param {string} email - User email
 * @param {string} otp - Generated OTP
 * @param {string} type - OTP type ('verification' or 'reset')
 * @param {number} expiresInMinutes - Expiration time in minutes
 */
const storeOTP = async (email, otp, type = 'verification', expiresInMinutes = 10) => {
  const db = getDb();
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + expiresInMinutes);
  
  const otpDocument = {
    email: email.toLowerCase(),
    otp,
    type,
    createdAt: new Date(),
    expiresAt: expiryTime
  };
  
  // Store in cache as backup
  const cacheKey = `${email.toLowerCase()}:${type}`;
  otpCache.set(cacheKey, otpDocument);

  try {
    if (!db) {
      console.warn('Database not available, using in-memory OTP storage only');
      return;
    }

    // Check if collection exists, create if not
    const collections = await db.listCollections({ name: OTP_COLLECTION }).toArray();
    if (collections.length === 0) {
      await db.createCollection(OTP_COLLECTION);
      
      // Create TTL index to auto-expire OTPs
      await db.collection(OTP_COLLECTION).createIndex(
        { expiresAt: 1 }, 
        { expireAfterSeconds: 0 }
      );
      
      // Create compound index for faster lookups
      await db.collection(OTP_COLLECTION).createIndex({ email: 1, type: 1 });
    }

    // Delete any existing OTPs for this email and type
    await db.collection(OTP_COLLECTION).deleteMany({ 
      email: email.toLowerCase(),
      type: type
    });
    
    // Insert new OTP
    await db.collection(OTP_COLLECTION).insertOne(otpDocument);
    console.log(`OTP stored for ${email} (${type})`);
  } catch (error) {
    console.error('Error storing OTP in database:', error);
  }
};

/**
 * Generate and send OTP
 * @param {string} email - User email
 * @param {string} type - OTP type ('verification' or 'reset')
 * @returns {Promise<boolean>} - Success status
 */
const generateAndSendOTP = async (email, type = 'verification') => {
  try {
    const otp = generateOTP();
    await storeOTP(email, otp, type);
    const emailSent = await sendOTPEmail(email, otp, type);
    
    if (emailSent) {
      console.log(`OTP sent successfully to ${email} (${type})`);
    } else {
      console.error(`Failed to send OTP to ${email} (${type})`);
    }
    
    return emailSent;
  } catch (error) {
    console.error('Failed to generate and send OTP:', error);
    return false;
  }
};

/**
 * Verify OTP provided by user
 * @param {string} email - User email
 * @param {string} userProvidedOTP - OTP provided by user
 * @param {string} type - OTP type ('verification' or 'reset')
 * @returns {Promise<boolean>} - Whether OTP is valid
 */
const verifyOTP = async (email, userProvidedOTP, type = 'verification') => {
  if (!email || !userProvidedOTP) {
    console.log('Missing email or OTP for verification');
    return false;
  }
  
  const normalizedEmail = email.toLowerCase();
  const cacheKey = `${normalizedEmail}:${type}`;
  const db = getDb();
  
  try {
    // Try database first
    if (db) {
      const otpRecord = await db.collection(OTP_COLLECTION).findOne({
        email: normalizedEmail,
        type: type,
        expiresAt: { $gt: new Date() }
      });
      
      if (otpRecord && otpRecord.otp === userProvidedOTP) {
        // Remove the used OTP
        await db.collection(OTP_COLLECTION).deleteOne({ _id: otpRecord._id });
        // Also remove from cache
        otpCache.delete(cacheKey);
        console.log(`OTP verified successfully for ${email} (${type})`);
        return true;
      }
    }
    
    // Fallback to cache check
    const cachedOtp = otpCache.get(cacheKey);
    if (cachedOtp && 
        cachedOtp.otp === userProvidedOTP && 
        cachedOtp.expiresAt > new Date()) {
      otpCache.delete(cacheKey);
      console.log(`OTP verified from cache for ${email} (${type})`);
      return true;
    }
    
    console.log(`Invalid or expired OTP for ${email} (${type})`);
    return false;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    
    // Final fallback to cache-only check
    const cachedOtp = otpCache.get(cacheKey);
    if (cachedOtp && 
        cachedOtp.otp === userProvidedOTP && 
        cachedOtp.expiresAt > new Date()) {
      otpCache.delete(cacheKey);
      console.log(`OTP verified from cache (fallback) for ${email} (${type})`);
      return true;
    }
    
    return false;
  }
};

// Clean up expired OTPs from cache periodically
setInterval(() => {
  const now = new Date();
  for (const [key, otp] of otpCache.entries()) {
    if (otp.expiresAt <= now) {
      otpCache.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

module.exports = {
  generateAndSendOTP,
  verifyOTP
};
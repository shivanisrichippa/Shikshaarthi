
// models/OTP.js - FIXED version
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  tempUserId: {
    type: String,
    required: true
    // Removed index: true to avoid duplicate with compound index below
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
    // Removed index: true to avoid duplicate with compound index below
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  type: {
    type: String,
    enum: ['registration', 'password_reset', 'email_verification'],
    default: 'registration',
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
    // Removed index: true to avoid duplicate with timestamps: true
  }
}, { 
  collection: 'otps',
  timestamps: true
});

// Compound indexes for better performance (keep these)
otpSchema.index({ tempUserId: 1, type: 1 });
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ otp: 1, type: 1 });
otpSchema.index({ isVerified: 1 });

// Auto-delete expired documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);

// models/PasswordReset.js - FIXED
const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  tempUserId: {
    type: String,
    required: true,
    unique: true
    // Removed index: true to avoid duplicate with unique: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
    // Removed index: true to avoid duplicate with separate index below
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    sparse: true // For email link method if implemented
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Auto-delete after 1 hour
    // Removed index: true to avoid duplicate with separate index below
  }
}, { 
  collection: 'passwordresets',
  timestamps: true
});

// Indexes for better performance (keep separate ones, remove duplicates)
// passwordResetSchema.index({ tempUserId: 1 }, { unique: true }); // REMOVED - already unique: true above
passwordResetSchema.index({ email: 1 });
passwordResetSchema.index({ isUsed: 1 });
// passwordResetSchema.index({ createdAt: 1 }); // REMOVED - already has expires and timestamps: true

module.exports = mongoose.model('PasswordReset', passwordResetSchema);

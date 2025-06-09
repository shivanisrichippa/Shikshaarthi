
// Fixed TempUser.js - FIXED version
const mongoose = require('mongoose');

const tempUserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true
    // Removed index: true if it was there
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['pending_verification', 'completed', 'failed'],
    default: 'pending_verification'
  },
  otpAttempts: {
    type: Number,
    default: 0,
    max: 3
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Auto-delete after 1 hour
  }
}, { 
  collection: 'tempusers',
  timestamps: true
});

// Define indexes only once to avoid duplicates
// Note: You had orderId in index but not in schema - assuming this should be _id or email
tempUserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('TempUser', tempUserSchema);


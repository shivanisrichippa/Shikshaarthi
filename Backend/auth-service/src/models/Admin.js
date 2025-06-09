// auth-service/src/models/Admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
    select: false, // Don't include password in queries by default
  },
}, { 
  timestamps: true, 
  collection: 'admins' 
});

// Index for faster email lookups
AdminSchema.index({ email: 1 });

// Hash password before saving
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(config.BCRYPT_ROUNDS || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error("Error hashing admin password:", error);
    next(error);
  }
});

// Method to compare passwords
AdminSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', AdminSchema);
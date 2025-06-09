// backend/rewards-service/src/models/service-schemas/ElectricianData.schema.js
const mongoose = require('mongoose');

const electricianDataSchema = new mongoose.Schema({
  centralSubmissionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: [true, "Electrician's name is required"], trim: true },
  mobile: { 
    type: String, 
    required: [true, "Mobile number is required"], 
    trim: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Mobile number must be 10 digits starting with 6-9'
    }
  },
  email: { 
    type: String, 
    trim: true, 
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  experience: { 
    type: String, 
    required: [true, "Experience is required"],
    validate: {
      validator: function(v) {
        const num = parseInt(v);
        return !isNaN(num) && num >= 0 && num <= 50;
      },
      message: 'Experience must be a number between 0 and 50'
    }
  },
  address: { 
    type: String, 
    required: [true, "Address is required"], 
    trim: true,
    minlength: [10, 'Address must be at least 10 characters long']
  },
  pincode: { 
    type: String, 
    required: [true, "Pincode is required"], 
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{6}$/.test(v);
      },
      message: 'Pincode must be a 6-digit number'
    }
  },
  district: { type: String, required: [true, "District is required"], trim: true },
  state: { type: String, required: [true, "State is required"], trim: true },
  aadharNumber: { 
    type: String, 
    required: [true, "Aadhar number is required"], 
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: 'Aadhar number must be a 12-digit number'
    }
  },
  specialization: { 
    type: String, 
    trim: true,
    enum: {
      values: [
        '', // Allow empty for optional field
        'House Wiring',
        'Commercial Wiring', 
        'Industrial Wiring',
        'Appliance Repair',
        'Motor Repair',
        'Panel Board Work',
        'Solar Installation',
        'General Electrical Work'
      ],
      message: 'Invalid specialization selected'
    }
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  imageUrls: [{ 
    _id: false,
    url: String,
    cloudinaryId: String,
    label: String, // To identify which type of image (Outside Image 1, Person Photo, etc.)
  }],
  // Optional: Add metadata for the 7 specific image types from your frontend
  imageMetadata: {
    outsideImage1: { url: String, cloudinaryId: String },
    insideImage1: { url: String, cloudinaryId: String },
    personPhoto: { url: String, cloudinaryId: String },
    aadharCardPhoto: { url: String, cloudinaryId: String },
    visitingCardInfo: { url: String, cloudinaryId: String }
  }
}, {
  timestamps: true,
  collection: 'electrician_data_submissions'
});

// Indexes for efficient queries
electricianDataSchema.index({ district: 1, state: 1, pincode: 1 });
electricianDataSchema.index({ specialization: 1 });
electricianDataSchema.index({ createdAt: -1 });

// Pre-save middleware to ensure at least 4 images are provided
electricianDataSchema.pre('save', function(next) {
  if (this.imageUrls && this.imageUrls.length < 4) {
    const error = new Error('At least 4 images are required: Person Photo, Aadhar Card, and minimum 2 service images');
    return next(error);
  }
  next();
});

module.exports = electricianDataSchema;

// backend/rewards-service/src/models/service-schemas/PlumberData.schema.js
const mongoose = require('mongoose');

const plumberDataSchema = new mongoose.Schema({
  centralSubmissionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: [true, "Plumber's name is required"], trim: true, minlength: 3 },
  mobile: { type: String, required: [true, "Mobile number is required"], trim: true, match: /^[6-9]\d{9}$/ },
  email: { type: String, trim: true, lowercase: true, match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'Invalid email format'] },
  experience: { type: Number, required: [true, "Experience is required"], min: 0, max: 50 }, // Kept as Number
  address: { type: String, required: [true, "Address is required"], trim: true, minlength: 10 },
  pincode: { type: String, required: [true, "Pincode is required"], trim: true, match: /^\d{6}$/ },
  district: { type: String, required: [true, "District is required"], trim: true },
  state: { type: String, required: [true, "State is required"], trim: true },
  aadharNumber: { type: String, required: [true, "Aadhar number is required"], trim: true, match: /^\d{12}$/ },
  specialization: { type: String, trim: true, enum: ["", "Pipe Fitting", "Leak Repair", "Bathroom Fitting", "Kitchen Plumbing", "Water Tank Installation", "Drain Cleaning", "Water Heater Repair", "General Plumbing"], default: "" },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  imageUrls: [{ // Generic array, like other services
    _id: false,
    url: String,
    cloudinaryId: String,
  }],
  // location field removed since form doesn't collect lat/long, and it caused errors. Add back if needed.
  // location: {
  //   type: { type: String, enum: ['Point'] }, // NO default for type
  //   coordinates: { type: [Number] }
  // },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  totalReviews: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'plumber_data_submissions' });

// plumberDataSchema.index({ location: '2dsphere' }, { sparse: true }); // Only if location field is present
plumberDataSchema.index({ district: 1, state: 1, pincode: 1 });
plumberDataSchema.index({ mobile: 1 }, { unique: true, sparse: true }); // Keep this
plumberDataSchema.index({ aadharNumber: 1 }, { unique: true, sparse: true }); // Keep this

module.exports = plumberDataSchema;
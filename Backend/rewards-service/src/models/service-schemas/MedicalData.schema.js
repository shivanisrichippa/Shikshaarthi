// backend/rewards-service/src/models/service-schemas/MedicalData.schema.js
const mongoose = require('mongoose');

const medicalDataSchema = new mongoose.Schema({
  centralSubmissionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: [true, "Facility name is required"], trim: true },
  type: {
    type: String,
    required: [true, "Facility type is required"],
    enum: ['Medical Shop', 'Hospital', 'Clinic', 'Diagnostic Center', 'Doctor', 'Other']
  },
  address: { type: String, required: [true, "Address is required"], trim: true },
  area: { type: String, trim: true, default: "" },
  landmark: { type: String, trim: true, default: "" },
  pincode: { /* ... validation ... */ type: String, required: true, trim: true, validate: { validator: (v) => /^\d{6}$/.test(v), message: 'Pincode must be 6 digits.'}},
  district: { type: String, required: [true, "District is required"], trim: true },
  state: { type: String, required: [true, "State is required"], trim: true },
  latitude: { type: String, trim: true, default: "" },
  longitude: { type: String, trim: true, default: "" },
  website: { type: String, trim: true, lowercase: true, default: "" },
  contactPerson: { type: String, trim: true, default: "" },
  mobile: { /* ... validation ... */ type: String, required: true, trim: true, validate: { validator: (v) => /^[6-9]\d{9}$/.test(v), message: 'Mobile must be 10 digits starting with 6-9.'}},
  alternateMobile: { type: String, trim: true, default: "" },
  email: { /* ... validation ... */ type: String, trim: true, lowercase: true, default: "", validate: { validator: function(v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}, message: 'Invalid email'}},
  operatingHours: { // Schema expects a nested object
    open: { type: String, trim: true, default: "" },
    close: { type: String, trim: true, default: "" }
  },
  services: { type: String, trim: true, default: "" },
  facilities: { type: String, trim: true, default: "" },
  specialization: { type: String, trim: true, default: "" },
  paymentMethods: { type: [String], default: [] },
  specializedServices: { type: [String], default: [] },
  imageUrls: [{ _id: false, url: String, cloudinaryId: String }],
}, { timestamps: true, collection: 'medical_data_submissions' });

medicalDataSchema.index({ district: 1, state: 1, pincode: 1 });
medicalDataSchema.index({ type: 1 });
medicalDataSchema.index({ name: 'text', specialization: 'text' });

module.exports = medicalDataSchema;
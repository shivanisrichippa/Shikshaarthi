// backend/rewards-service/src/models/service-schemas/MessData.schema.js
const mongoose = require('mongoose');

const messDataSchema = new mongoose.Schema({
  centralSubmissionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: [true, 'Mess name is required'] },
  description: { type: String, required: [true, 'Description is required'] },
  price: { type: String, required: [true, 'Price is required'] },
  address: { type: String, required: [true, 'Address is required'] },
  district: { type: String, required: [true, 'District is required'] },
  state: { type: String, required: [true, 'State is required'] },
  pincode: { type: String, required: [true, 'Pincode is required'] },
  messType: {
    type: String,
    enum: ['Pure Veg', 'Pure Non-Veg', 'Both Veg and Non-Veg'],
    required: [true, 'Mess type is required'],
  },
  holderName: { type: String, required: [true, 'Holder name is required'] },
  mobile: { type: String, required: [true, 'Mobile number is required'] },
  imageUrls: [{ _id: false, url: String, cloudinaryId: String }],
  location: { // Location is now entirely optional
    type: { type: String, enum: ['Point'] }, // No default
    coordinates: { type: [Number] }         // No index here directly if it can be absent;
                                            // MongoDB handles sparse indexes well if defined below.
  },
}, { timestamps: true, collection: 'mess_data_submissions' });

// Index location if it exists (sparse index)
messDataSchema.index({ location: '2dsphere' }, { sparse: true });
messDataSchema.index({ district: 1, state: 1, pincode: 1 });

module.exports = messDataSchema;
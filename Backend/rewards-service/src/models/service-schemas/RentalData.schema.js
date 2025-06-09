// backend/rewards-service/src/models/service-schemas/RentalData.schema.js
const mongoose = require('mongoose');

const rentalDataSchema = new mongoose.Schema({
  centralSubmissionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  
  // Basic Property Details
  name: { 
    type: String, 
    required: [true, "Property/Room name is required"], 
    trim: true,
    minlength: [3, "Property name must be at least 3 characters long"]
  },
  price: { 
    type: String, 
    required: [true, "Price is required"],
    trim: true
  },
  type: { 
    type: String, 
    required: [true, "Room/Property type is required"],
    enum: {
      values: ['PG', 'Hostel', 'Apartment', 'Shared Room', 'House', 'Flat', '1BHK', '2BHK', '1RK', 'Single Room'],
      message: 'Invalid property type'
    }
  },
  sharing: { 
    type: String, 
    trim: true,
    default: ""
  },
  rules: { 
    type: String, 
    trim: true,
    default: ""
  },
  
  // Address Details
  address: { 
    type: String, 
    required: [true, "Address is required"], 
    trim: true,
    minlength: [10, "Address must be at least 10 characters long"]
  },
  district: { 
    type: String, 
    required: [true, "District is required"], 
    trim: true 
  },
  state: { 
    type: String, 
    required: [true, "State is required"], 
    trim: true 
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
  
  // Property Features
  amenities: { 
    type: String, 
    trim: true,
    default: ""
  },
  
  // Owner Details
  holderName: { 
    type: String, 
    required: [true, "Owner name is required"], 
    trim: true,
    minlength: [3, "Owner name must be at least 3 characters long"]
  },
  mobile: { 
    type: String, 
    required: [true, "Owner mobile is required"], 
    trim: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Mobile number must be 10 digits and start with 6-9'
    }
  },
  email: { 
    type: String, 
    trim: true, 
    lowercase: true,
    validate: {
      validator: function(v) {
        // Only validate if email is provided (not empty)
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  
  // Images
  imageUrls: [{
    _id: false,
    url: String,
    cloudinaryId: String,
  }],
  
  // Optional: For future location-based searches
  // location: {
  //   type: { type: String, enum: ['Point'], default: 'Point' },
  //   coordinates: { type: [Number], index: '2dsphere' }
  // },
}, {
  timestamps: true,
  collection: 'rental_data_submissions',
});

// Indexes for efficient querying
rentalDataSchema.index({ district: 1, state: 1, pincode: 1 });
rentalDataSchema.index({ type: 1 });
rentalDataSchema.index({ price: 1 });
rentalDataSchema.index({ createdAt: -1 });

// Pre-save middleware to handle data processing
rentalDataSchema.pre('save', function(next) {
  // Convert price to uppercase if it contains "contact"
  if (this.price && this.price.toLowerCase().includes('contact')) {
    this.price = this.price.charAt(0).toUpperCase() + this.price.slice(1);
  }
  
  // Clean up amenities (remove extra spaces, empty entries)
  if (this.amenities) {
    this.amenities = this.amenities
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .join(', ');
  }
  
  next();
});

// Instance method to get formatted amenities array
rentalDataSchema.methods.getAmenitiesArray = function() {
  if (!this.amenities) return [];
  return this.amenities.split(',').map(item => item.trim()).filter(item => item.length > 0);
};

// Static method to find properties by location
rentalDataSchema.statics.findByLocation = function(district, state, pincode) {
  const query = {};
  if (district) query.district = new RegExp(district, 'i');
  if (state) query.state = new RegExp(state, 'i');
  if (pincode) query.pincode = pincode;
  
  return this.find(query);
};

// Static method to find properties by type
rentalDataSchema.statics.findByType = function(type) {
  return this.find({ type: type });
};

module.exports = rentalDataSchema;
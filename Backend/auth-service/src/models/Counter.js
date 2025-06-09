// auth-service/src/models/Counter.js (FIXED)
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: 'main'
  },
  happyCustomers: {
    type: Number,
    default: 689,
    min: 0
  },
  happyUsers: {
    type: Number,
    default: 507,
    min: 0
  },
  serviceProviders: {
    type: Number,
    default: 100,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'counters',
  timestamps: true
});

// Only define index once - removed duplicate
// counterSchema.index({ id: 1 }); // REMOVED - already unique: true above

module.exports = mongoose.model('Counter', counterSchema);

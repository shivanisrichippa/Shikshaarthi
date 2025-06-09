// auth-service/src/models/RewardRedemption.js
const mongoose = require('mongoose');

const rewardRedemptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  userEmail: { type: String, required: true },
  userFullName: { type: String, required: true },
  levelId: { type: Number, required: true },
  rewardName: { type: String, required: true },
  coinsDeducted: { type: Number, required: true },
  redeemedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending_fulfillment', 'fulfilled', 'failed', 'cancelled'],
    default: 'pending_fulfillment',
  },
  fulfillmentDetails: { type: String }, // e.g., Tracking ID, Voucher Code
}, {
  timestamps: true,
  collection: 'reward_redemptions'
});

// A user can only redeem a specific level once.
rewardRedemptionSchema.index({ userId: 1, levelId: 1 }, { unique: true });

module.exports = mongoose.model('RewardRedemption', rewardRedemptionSchema);
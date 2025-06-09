// rewards-service/src/models/CoinTransaction.model.js (CORRECTED)
const mongoose = require('mongoose');
const { getDbConnection } = require('../config/db');
const logger =require('../config/logger');

const coinTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'signup_bonus', 
        'submission_reward',
        'referral_bonus',
        'reward_redemption',
        'admin_credit',
        'admin_debit',
        'spin_wheel_reward',
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    relatedSubmissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CentralSubmission',
    },
    serviceType: {
      type: String,
      enum: ['mess', 'rental', 'plumber', 'electrician', 'laundry', 'medical'],
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'coin_transactions',
  }
);

coinTransactionSchema.statics.getCurrentBalance = async function (userId) {
  try {
    const result = await this.aggregate([ // 'this' refers to the Model
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$userId', balance: { $sum: '$amount' } } },
    ]);
    return result.length > 0 ? result[0].balance : 0;
  } catch (error) {
    logger.error(`Error calculating current balance for user ${userId}:`, error);
    return 0; // Or throw error
  }
};

let CoinTransactionModel = null;

function getModel() {
  if (CoinTransactionModel) {
    return CoinTransactionModel;
  }
  const rewardsDb = getDbConnection('rewards');
  if (!rewardsDb) {
    logger.error("Rewards database connection not available when attempting to get CoinTransaction model.");
    return null;
  }
  try {
    CoinTransactionModel = rewardsDb.model('CoinTransaction', coinTransactionSchema);
  } catch (e) {
      if (e.name === 'OverwriteModelError') {
          CoinTransactionModel = rewardsDb.model('CoinTransaction');
      } else {
          logger.error("Error compiling CoinTransaction model:", e);
          throw e;
      }
  }
  return CoinTransactionModel;
}

module.exports = { getModel };
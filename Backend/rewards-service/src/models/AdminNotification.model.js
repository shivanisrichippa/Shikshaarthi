// rewards-service/src/models/AdminNotification.model.js
const mongoose = require('mongoose');
const { getDbConnection } = require('../config/db');
const logger = require('../config/logger');

const adminNotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
        'new_submission', 
        'reward_redemption_request',
        'spin_wheel_win', // <-- FIX: Added this new type for spin wheel prizes
        'user_message', 
        'system_alert'
    ],
    required: true,
  },
  message: { type: String, required: true },
  link: String, // e.g., /admin/users/:userId/manage
  isRead: { type: Boolean, default: false, index: true },
  readBy: { type: mongoose.Schema.Types.ObjectId },
  userId: { type: mongoose.Schema.Types.ObjectId },
  userName: String,
  userEmail: String,
}, {
  timestamps: true,
  collection: 'admin_notifications',
});

adminNotificationSchema.index({ isRead: 1, createdAt: -1 });

let AdminNotificationModel = null;

function getModel() {
  if (AdminNotificationModel) return AdminNotificationModel;
  
  const rewardsDb = getDbConnection('rewards');
  if (!rewardsDb) {
    logger.error("[AdminNotificationModel] Rewards DB connection not available.");
    return null;
  }
  
  try {
    AdminNotificationModel = rewardsDb.model('AdminNotification', adminNotificationSchema);
  } catch (e) {
    if (e.name === 'OverwriteModelError') {
      AdminNotificationModel = rewardsDb.model('AdminNotification');
    } else {
      throw e;
    }
  }
  return AdminNotificationModel;
}

module.exports = { getModel };
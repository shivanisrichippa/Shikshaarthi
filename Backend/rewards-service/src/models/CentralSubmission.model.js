const mongoose = require('mongoose');
const { getDbConnection } = require('../config/db');
const logger = require('../config/logger'); // Import logger

const centralSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Conceptually, from auth-service
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['mess', 'rental', 'plumber', 'electrician', 'laundry', 'medical'],
      required: true,
      index: true,
    },
    serviceDataId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    imageUrls: [
      {
        _id: false, // Don't create an _id for subdocuments unless needed
        url: String,
        cloudinaryId: String,
      },
    ],
    adminNotes: String,
    rejectionReason: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin', // Conceptually
    },
    verifiedAt: Date,
    rejectedAt: Date,
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    titlePreview: String,
    locationPreview: String,
  },
  {
    timestamps: true,
    collection: 'central_submissions',
  }
);

let CentralSubmissionModel = null;

function getModel() {
  if (CentralSubmissionModel) {
    return CentralSubmissionModel;
  }

  const rewardsDb = getDbConnection('rewards');
  if (!rewardsDb) {
    logger.error("Rewards database connection not available when attempting to get CentralSubmission model.");
    // In a real scenario, you might throw an error that the calling code (controller) handles
    // by returning a 503 Service Unavailable or similar.
    // For now, returning null allows the controller to check and handle.
    return null;
  }
  try {
    CentralSubmissionModel = rewardsDb.model('CentralSubmission', centralSubmissionSchema);
  } catch (e) {
      // This can happen if the model is already compiled on the connection due to multiple calls
      // Mongoose throws an error if you try to recompile a model.
      if (e.name === 'OverwriteModelError') {
          CentralSubmissionModel = rewardsDb.model('CentralSubmission');
      } else {
          logger.error("Error compiling CentralSubmission model:", e);
          throw e; // Re-throw other errors
      }
  }
  return CentralSubmissionModel;
}

module.exports = { getModel };
// ========================================================================
// FILE: rewards-service/src/controllers/admin.controller.js (CORRECTED)
// ========================================================================

const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');
const CentralSubmissionModule = require('../models/CentralSubmission.model');
const CoinTransactionModule = require('../models/CoinTransaction.model');
const { getServiceModel } = require('../utils/service-model.util');
const coinCalculatorService = require('../services/coin-calculator.service');
const authApiService = require('../services/auth-api.service');
const notificationService = require('../services/notification.service');
const logger = require('../config/logger');
const { getDbConnection } = require('../config/db');

const getAdminSubmissions = async (req, res) => {
  const reqIdForLog = req.user?.id ? `admin-${req.user.id.slice(-4)}-getsubs-${Date.now().toString().slice(-5)}` : `get-admin-submissions-${Date.now()}`;
  logger.info(`[${reqIdForLog}] Admin submission fetch request received.`, { query: req.query });

  const { status = 'all', page = 1, limit = 10, serviceType } = req.query; // Default to 'all' for clarity
  const CentralSubmission = CentralSubmissionModule.getModel();

  if (!CentralSubmission) {
    logger.error(`[${reqIdForLog}] CRITICAL: CentralSubmission model is not available.`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Service temporarily unavailable." });
  }

  try {
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (serviceType) {
      query.serviceType = serviceType;
    }

    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort: { createdAt: -1 },
    };
    const skip = (options.page - 1) * options.limit;

    const submissions = await CentralSubmission.find(query)
        .sort(options.sort)
        .skip(skip)
        .limit(options.limit)
        .lean();
    
    const totalDocs = await CentralSubmission.countDocuments(query);
    
    logger.info(`[${reqIdForLog}] Successfully fetched ${submissions.length} of ${totalDocs} submissions.`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Admin submissions fetched successfully.',
      data: submissions,
      pagination: {
        totalDocs,
        limit: options.limit,
        page: options.page,
        totalPages: Math.ceil(totalDocs / options.limit),
      }
    });
  } catch (error) {
    logger.error(`[${reqIdForLog}] Error fetching admin submissions:`, error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to fetch admin submissions.' });
  }
};

const getSubmissionDetails = async (req, res) => {
    const { submissionId } = req.params;
    const adminUserId = req.user.userId;
    const reqIdForLog = `admin-${adminUserId.slice(-4)}-details-${submissionId.slice(-5)}`;
    
    logger.info(`[${reqIdForLog}] Admin fetching details for submission ${submissionId}`);
  
    const CentralSubmission = CentralSubmissionModule.getModel();
    if (!CentralSubmission) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Service unavailable." });
    }
  
    try {
      const submission = await CentralSubmission.findById(submissionId).lean();
      if (!submission) {
        return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Submission not found.' });
      }
  
      const ServiceModel = getServiceModel(submission.serviceType);
      if (!ServiceModel) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: `Internal error: Service model for '${submission.serviceType}' not found.` });
      }
  
      const serviceSpecificData = await ServiceModel.findById(submission.serviceDataId).lean();
      if (!serviceSpecificData) {
        return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Service-specific data is missing for this submission.' });
      }
  
      const detailedSubmission = { ...submission, serviceSpecificData };
      
      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Submission details fetched successfully.',
        data: detailedSubmission
      });
  
    } catch (error) {
      logger.error(`[${reqIdForLog}] Error fetching submission details for ${submissionId}:`, error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to fetch submission details.' });
    }
};

const updateSubmissionData = async (req, res) => {
    const { submissionId } = req.params;
    const updatedData = req.body;
    const adminUserId = req.user.userId;
    const reqIdForLog = `admin-${adminUserId.slice(-4)}-update-${submissionId.slice(-5)}`;

    logger.info(`[${reqIdForLog}] Attempting to update data for submission ${submissionId}`);

    const CentralSubmission = CentralSubmissionModule.getModel();
    if (!CentralSubmission) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Service unavailable." });

    try {
        const submission = await CentralSubmission.findById(submissionId);
        if (!submission) {
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Submission not found." });
        }
        if (submission.status !== 'pending') {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Cannot edit a submission that has already been processed." });
        }

        const ServiceModel = getServiceModel(submission.serviceType);
        if (!ServiceModel) {
            throw new Error(`Service model for ${submission.serviceType} not found.`);
        }

        // Sanitize update data
        delete updatedData._id;
        delete updatedData.userId;
        delete updatedData.centralSubmissionId;
        delete updatedData.createdAt;
        delete updatedData.updatedAt;

        const updatedServiceData = await ServiceModel.findByIdAndUpdate(
            submission.serviceDataId,
            { $set: updatedData },
            { new: true, runValidators: true }
        ).lean();
        
        if(!updatedServiceData) {
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Service-specific data record not found." });
        }
        
        submission.titlePreview = updatedServiceData.name || updatedServiceData.title || submission.titlePreview;
        submission.locationPreview = `${updatedServiceData.district || 'N/A'}, ${updatedServiceData.state || 'N/A'}`.replace(/^, |, $/g, '');
        await submission.save();

        logger.info(`[${reqIdForLog}] Successfully updated data for submission ${submissionId}.`);
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Submission data updated successfully.",
            data: updatedServiceData,
        });

    } catch (error) {
        logger.error(`[${reqIdForLog}] Error updating submission data for ${submissionId}:`, error);
        if (error.name === 'ValidationError') {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Validation Error: ${error.message}`});
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Failed to update submission data." });
    }
};

const approveSubmission = async (req, res) => {
  const { submissionId } = req.params;
  const { adminNotes } = req.body;
  const adminUserId = req.user.userId;
  const reqIdForLog = `admin-${adminUserId.slice(-4)}-approve-${submissionId.slice(-5)}`;

  logger.info(`[${reqIdForLog}] Starting approval process for submission ${submissionId}`, { adminId: adminUserId, notes: adminNotes });

  const rewardsDb = getDbConnection('rewards');
  if (!rewardsDb) {
      logger.error(`[${reqIdForLog}] CRITICAL: Could not get rewards DB connection.`);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Database service is not ready.' });
  }

  const session = await rewardsDb.startSession();

  try {
      session.startTransaction();
      logger.info(`[${reqIdForLog}] Database transaction started successfully.`);

      const CentralSubmission = CentralSubmissionModule.getModel();
      const CoinTransaction = CoinTransactionModule.getModel();

      const submission = await CentralSubmission.findById(submissionId).session(session);
      if (!submission) {
          await session.abortTransaction();
          return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Submission not found.' });
      }
      logger.info(`[${reqIdForLog}] Found submission, status: ${submission.status}.`);

      if (submission.status !== 'pending') {
          await session.abortTransaction();
          return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Submission already processed. Status: ${submission.status}` });
      }

      // 1. Prepare DB changes in memory
      submission.status = 'verified';
      submission.verifiedBy = adminUserId;
      submission.verifiedAt = new Date();
      submission.adminNotes = adminNotes;
    
      const coinsToAward = coinCalculatorService.calculateCoinsForSubmission(submission.serviceType);
      let coinTx; // Will hold the coin transaction document if created
    
      // 2. Prepare all calls to the auth-service
      const apiPromises = [];

      // 2a. Award coins for the submission
      if (coinsToAward > 0) {
          logger.info(`[${reqIdForLog}] Preparing coin transaction for ${coinsToAward} coins.`);
          coinTx = new CoinTransaction({ // Create object, but DO NOT save yet
              userId: submission.userId,
              userEmail: submission.userEmail,
              type: 'submission_reward',
              amount: coinsToAward,
              description: `Reward for verified ${submission.serviceType} submission.`,
              relatedSubmissionId: submission._id,
              serviceType: submission.serviceType,
          });
          apiPromises.push(authApiService.awardCoins(submission.userId, coinsToAward, `Reward for ${submission.serviceType}`));
      }
      
      // 2b. Grant a spin for the approved submission
      logger.info(`[${reqIdForLog}] Preparing to grant 1 spin to user ${submission.userId}.`);
      apiPromises.push(authApiService.grantSpin(submission.userId));
      
      // 2c. Increment the user's 'verified' stats
      apiPromises.push(authApiService.incrementSubmissionStats(submission.userId, 'verified'));

      // 3. Execute all external API calls *before* writing to the database
      logger.info(`[${reqIdForLog}] Executing ${apiPromises.length} API calls to auth-service.`);
      await Promise.all(apiPromises);
      logger.info(`[${reqIdForLog}] All API calls to auth-service successful.`);

      // 4. Now that external calls succeeded, save all DB changes and commit the transaction
      if (coinTx) {
          await coinTx.save({ session });
      }
      await submission.save({ session });
      
      await session.commitTransaction();
      logger.info(`[${reqIdForLog}] Transaction committed successfully.`);
    
      // 5. Send a notification to the user (fire-and-forget)
      const userMessage = `Your submission "${submission.titlePreview || ''}" has been approved! You earned ${coinsToAward} Supercoins and 1 Spin Wheel chance!`;
      notificationService.createUserStatusUpdateNotification(submission, userMessage);

      // 6. Return the final success response
      return res.status(StatusCodes.OK).json({ 
          success: true, 
          message: 'Submission approved, coins awarded, and spin granted successfully.', 
          data: submission 
      });

  } catch (error) {
      logger.error(`[${reqIdForLog}] CRITICAL ERROR during approval:`, { message: error.message, stack: error.stack });
      if (session.inTransaction()) {
          await session.abortTransaction();
          logger.warn(`[${reqIdForLog}] Transaction aborted due to error.`);
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to approve submission due to an internal error.' });
  } finally {
      await session.endSession();
      logger.info(`[${reqIdForLog}] Session ended.`);
  }
};


const rejectSubmission = async (req, res) => {
    const { submissionId } = req.params;
    const { adminNotes } = req.body;
    const adminUserId = req.user.userId;
    const reqIdForLog = `admin-${adminUserId.slice(-4)}-reject-${submissionId.slice(-5)}`;

    logger.info(`[${reqIdForLog}] Starting rejection process for submission ${submissionId}`, { adminId: adminUserId, reason: adminNotes });

    const rewardsDb = getDbConnection('rewards');
    if (!rewardsDb) {
        logger.error(`[${reqIdForLog}] CRITICAL: Could not get rewards DB connection.`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Database service is not ready.' });
    }

    const session = await rewardsDb.startSession();

    try {
        const CentralSubmission = CentralSubmissionModule.getModel();
        session.startTransaction();
        logger.info(`[${reqIdForLog}] Database transaction started successfully.`);

        const submission = await CentralSubmission.findById(submissionId).session(session);
        if (!submission) {
            await session.abortTransaction();
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Submission not found.' });
        }
        logger.info(`[${reqIdForLog}] Found submission, status: ${submission.status}.`);

        if (submission.status !== 'pending') {
            await session.abortTransaction();
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Submission already processed. Status: ${submission.status}` });
        }

        // Prepare DB changes in memory
        submission.status = 'rejected';
        submission.rejectedAt = new Date();
        submission.verifiedBy = adminUserId;
        submission.rejectionReason = adminNotes;
        submission.adminNotes = adminNotes;

        // Perform external API call before DB writes
        logger.info(`[${reqIdForLog}] Calling auth-service to increment stats ('rejected')...`);
        await authApiService.incrementSubmissionStats(submission.userId, 'rejected');
        logger.info(`[${reqIdForLog}] API call to auth-service successful.`);

        // Now save to DB and commit
        await submission.save({ session });
        await session.commitTransaction();
        logger.info(`[${reqIdForLog}] Transaction committed.`);

        const userMessage = `Your submission "${submission.titlePreview || ''}" was rejected. Reason: ${adminNotes}`;
        await notificationService.createUserStatusUpdateNotification(submission, userMessage);

        return res.status(StatusCodes.OK).json({ success: true, message: 'Submission rejected successfully.', data: submission });

    } catch (error) {
        logger.error(`[${reqIdForLog}] CRITICAL ERROR during rejection:`, { message: error.message, stack: error.stack });
        if (session.inTransaction()) {
            await session.abortTransaction();
            logger.warn(`[${reqIdForLog}] Transaction aborted due to error.`);
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to reject submission.' });
    } finally {
        await session.endSession();
        logger.info(`[${reqIdForLog}] Session ended.`);
    }
};


module.exports = {
  getAdminSubmissions,
  getSubmissionDetails,
  updateSubmissionData,
  approveSubmission,
  rejectSubmission,
};
// backend/rewards-service/src/controllers/submission.controller.js
const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');
const CentralSubmissionModelModule = require('../models/CentralSubmission.model');
const { getServiceModel } = require('../utils/service-model.util');
const storageService = require('../services/storage.service');
const authApiService = require('../services/auth-api.service');
const notificationService = require('../services/notification.service');
const logger = require('../config/logger');
const { getDbConnection } = require('../config/db');

const submitData = async (req, res) => {
  const overallStartTime = Date.now();
  const reqIdForLog = req.user?.userId ? `user-${req.user.userId.slice(-6)}-sub-${Date.now().toString().slice(-5)}` : `submission-${Date.now()}`;

  logger.info(`[${reqIdForLog}] --- New Submission Request Received ---`);
  // (Existing logging for user, serviceType, data, files - good)
  logger.debug(`[${reqIdForLog}] Request User from JWT: ${JSON.stringify(req.user)}`);
  logger.debug(`[${reqIdForLog}] ServiceType: ${req.body.serviceType}`);
  logger.debug(`[${reqIdForLog}] req.body.data (type: ${typeof req.body.data}): ${typeof req.body.data === 'string' ? req.body.data.substring(0,300) : JSON.stringify(req.body.data).substring(0,300)}...`);
  logger.debug(`[${reqIdForLog}] Files Count: ${req.files ? req.files.length : 'No files'}`);
  if (req.files && req.files.length > 0) {
    req.files.forEach((f, i) => logger.debug(`[${reqIdForLog}] File ${i + 1}: ${f.originalname}, size: ${f.size} bytes, mimetype: ${f.mimetype}`));
  }


  const CentralSubmission = CentralSubmissionModelModule.getModel();
  if (!CentralSubmission) {
    logger.error(`[${reqIdForLog}] CRITICAL: CentralSubmission model is not available. Rewards DB might be down or model not loaded.`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Service temporarily unavailable due to a database model issue." });
  }

  const userId = req.user?.userId;
  const userEmail = req.user?.email;
  const userName = req.user?.name;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    logger.error(`[${reqIdForLog}] CRITICAL: User ID ('${userId}') from JWT is missing or invalid. Aborting.`);
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication details invalid or missing. Please log in again.", code: "INVALID_USERID_JWT" });
  }
  if (!userEmail) {
    logger.warn(`[${reqIdForLog}] User Email is missing in JWT for userId '${userId}'. Proceeding, but this may affect notifications or other email-dependent features.`);
  }

  const { serviceType } = req.body;
  const files = req.files;
  let parsedData = req.body.data;

  if (typeof parsedData === 'string') {
    try {
        logger.warn(`[${reqIdForLog}] 'data' field was a string in controller. Attempting parse. Best to parse in middleware.`);
        parsedData = JSON.parse(parsedData);
    } catch (parseError) {
        logger.error(`[${reqIdForLog}] CRITICAL: Failed to parse 'data' field (string) in controller. Error: ${parseError.message}`, { rawDataString: req.body.data.substring(0,100) });
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid form data: "data" field is malformed or not valid JSON.' });
    }
  }

  if (!parsedData || typeof parsedData !== 'object') {
    logger.error(`[${reqIdForLog}] CRITICAL: 'data' field is not an object after potential parsing. Type: ${typeof parsedData}`);
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid form data structure. The "data" field is malformed or missing.' });
  }

  if (!files || files.length < 1) {
    logger.warn(`[${reqIdForLog}] Submission attempt with no files. Backend requires at least 1.`);
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Please upload at least 1 image for the submission.' });
  }
  if (files.length > 6) {
    logger.warn(`[${reqIdForLog}] Submission attempt with too many files (${files.length}). Max 6 allowed.`);
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Maximum 6 images allowed per submission.' });
  }

  let session;
  let uploadedImageDetails = [];

  try {
    const rewardsDbConnection = getDbConnection('rewards');
    if (!rewardsDbConnection) {
      logger.error(`[${reqIdForLog}] CRITICAL: Rewards DB connection not available for transaction.`);
      throw new Error("Database connection error for rewards service.");
    }
    session = await rewardsDbConnection.startSession();
    session.startTransaction({
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' }
    });
    logger.info(`[TIMING][${reqIdForLog}] MongoDB transaction started for service '${serviceType}' on 'rewards' DB.`);

    const cloudinaryUploadOverallStartTime = Date.now();
    logger.info(`[TIMING][${reqIdForLog}] 1. Starting Cloudinary uploads for ${files.length} files (PARALLEL).`);
    
    const uploadPromises = files.map((file, index) => {
      return storageService.uploadImage(file.buffer, file.originalname, { folder: `shikshaarthi/${serviceType}_submissions/${userId}` })
        .then(result => {
          logger.info(`[TIMING][${reqIdForLog}]   PARALLEL[${index}]: Finished upload for ${file.originalname}. URL: ${result.url.substring(0, 60)}...`);
          return result;
        })
        .catch(uploadError => {
          // Log the specific error from storageService
          logger.error(`[TIMING][${reqIdForLog}]   PARALLEL[${index}]: FAILED to upload ${file.originalname}. Storage Service Error: Name: ${uploadError.name}, Message: ${uploadError.message}`, { 
            stack: uploadError.stack, 
            cloudinaryHttpCode: uploadError.http_code // If Cloudinary SDK provides it
          });
          
          // Create a more user-friendly error to propagate
          let clientMessage = `Upload failed for ${file.originalname}`;
          if (uploadError.message && uploadError.message.toLowerCase().includes('stale request')) {
            clientMessage += `: The request to the image server was too old. Please check your system's time and try again.`;
          } else if (uploadError.message) {
            clientMessage += `: ${uploadError.message.substring(0,100)}`;
          }

          const errorToThrow = new Error(clientMessage);
          errorToThrow.fileDetails = { name: file.originalname, size: file.size };
          errorToThrow.originalErrorName = uploadError.name;
          errorToThrow.isStorageError = true; // Flag to identify storage related errors
          if (uploadError.http_code) errorToThrow.http_code = uploadError.http_code;
          throw errorToThrow; // This ensures Promise.all will reject
        });
    });
    
    const allUploadsTimeoutMs = 120000; // 2 minutes
    let raceTimeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      raceTimeoutId = setTimeout(() => {
        logger.error(`[TIMING][${reqIdForLog}] Cloudinary batch upload TIMEOUT (${allUploadsTimeoutMs / 1000}s) triggered.`);
        const timeoutError = new Error(`Cloudinary batch upload timeout exceeded (${allUploadsTimeoutMs / 1000}s). Some images may not have uploaded.`);
        timeoutError.isTimeoutError = true;
        reject(timeoutError);
      }, allUploadsTimeoutMs);
    });

    try {
      uploadedImageDetails = await Promise.race([Promise.all(uploadPromises), timeoutPromise]);
      clearTimeout(raceTimeoutId); // Important to clear if Promise.all resolves or rejects first
      logger.info(`[TIMING][${reqIdForLog}] 1. Cloudinary uploads COMPLETED. ${uploadedImageDetails.length} images uploaded in ${Date.now() - cloudinaryUploadOverallStartTime}ms.`);
    } catch (batchUploadError) {
      clearTimeout(raceTimeoutId); // Also clear if timeoutPromise was not the one that rejected
      logger.error(`[TIMING][${reqIdForLog}] Error during Cloudinary batch upload processing (Promise.race likely from Promise.all or timeout): ${batchUploadError.message}`, { 
          stack: batchUploadError.stack, 
          originalErrorName: batchUploadError.originalErrorName,
          isTimeoutError: batchUploadError.isTimeoutError,
          isStorageError: batchUploadError.isStorageError
      });
      throw batchUploadError; // Re-throw to be caught by the main try-catch block
    }

    // (Rest of the database operations and post-commit logic remains the same)
    // 2. Database Operations
    const dbOpsStartTime = Date.now();
    logger.info(`[TIMING][${reqIdForLog}] 2. Starting database operations (CentralSubmission, ServiceModel).`);

    const CentralSubmissionModel = CentralSubmissionModelModule.getModel();
    const centralSubmission = new CentralSubmissionModel({
      userId: new mongoose.Types.ObjectId(userId),
      userEmail,
      serviceType,
      status: 'pending',
      imageUrls: uploadedImageDetails.map(img => ({ url: img.url, cloudinaryId: img.cloudinaryId })),
      serviceDataId: new mongoose.Types.ObjectId(),
      titlePreview: parsedData.name || parsedData.title || `Submission: ${serviceType}`,
      locationPreview: `${parsedData.district || 'N/A'}, ${parsedData.state || 'N/A'}`.replace(/^, |, $/g, ''),
    });

    const ServiceModel = getServiceModel(serviceType);
    if (!ServiceModel) {
      logger.error(`[${reqIdForLog}] CRITICAL: Could not get service model for type: "${serviceType}".`);
      throw new Error(`Invalid service type or model not configured: ${serviceType}`);
    }
    logger.info(`[${reqIdForLog}] Using ServiceModel '${ServiceModel.modelName}' for DB '${ServiceModel.db.name}'.`);

    const serviceDataPayload = {
      ...parsedData,
      userId: new mongoose.Types.ObjectId(userId),
      centralSubmissionId: centralSubmission._id,
      imageUrls: uploadedImageDetails.map(img => ({ url: img.url, cloudinaryId: img.cloudinaryId })),
    };
    delete serviceDataPayload.latitude;
    delete serviceDataPayload.longitude;
    delete serviceDataPayload.location;

    const serviceDataInstance = new ServiceModel(serviceDataPayload);
    const savedServiceData = await serviceDataInstance.save();
    logger.info(`[TIMING][${reqIdForLog}]   Saved service-specific data (_id: ${savedServiceData._id}) for ${ServiceModel.modelName}.`);

    centralSubmission.serviceDataId = savedServiceData._id;
    await centralSubmission.save({ session });
    logger.info(`[TIMING][${reqIdForLog}]   Saved CentralSubmission (_id: ${centralSubmission._id}) with linked serviceDataId.`);
    logger.info(`[TIMING][${reqIdForLog}] 2. Database operations finished in ${Date.now() - dbOpsStartTime}ms.`);

    await session.commitTransaction();
    const transactionCommitTime = Date.now();
    logger.info(`[TIMING][${reqIdForLog}] SUCCESS: Transaction committed for submission ${centralSubmission._id}.`);

    // 3. Post-Commit External API calls
    logger.info(`[TIMING][${reqIdForLog}] 3. Starting post-commit external API calls (auth-service, notifications)...`);
    const postCommitPromises = [
      authApiService.incrementSubmittedCount(userId)
        .then(() => logger.info(`[${reqIdForLog}]   Auth service: submittedCount incremented for ${userId}.`))
        .catch(error => logger.error(`[${reqIdForLog}]   Auth service call to increment submittedCount for ${userId} failed: ${error.message}`, { errorDetails: error })),
      
      notificationService.createAdminNewSubmissionNotification(
        centralSubmission,
        parsedData.name || `New ${serviceType} data`,
        { id: userId, name: userName || userEmail, email: userEmail }
      )
      .then(() => logger.info(`[${reqIdForLog}]   Notification service: admin notification created for submission ${centralSubmission._id}.`))
      .catch(error => logger.error(`[${reqIdForLog}]   Notification creation for submission ${centralSubmission._id} failed: ${error.message}`, { errorDetails: error }))
    ];
    
    Promise.allSettled(postCommitPromises).then(results => {
        const externalOpsDuration = Date.now() - transactionCommitTime;
        logger.info(`[TIMING][${reqIdForLog}] 3. Post-commit external API calls (Promise.allSettled) finished in ${externalOpsDuration}ms.`);
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                const serviceName = index === 0 ? 'Auth Service (submittedCount)' : 'Notification Service';
                logger.warn(`[${reqIdForLog}]   ${serviceName} operation failed post-commit: ${result.reason?.message || JSON.stringify(result.reason)}`);
            }
        });
    });

    const totalRequestTime = Date.now() - overallStartTime;
    logger.info(`[TIMING][${reqIdForLog}] Request ${reqIdForLog} processed successfully. Total time: ${totalRequestTime}ms.`);

    return res.status(StatusCodes.CREATED).json({
      message: 'Submission successful! Your contribution is now pending verification.',
      submissionId: centralSubmission._id,
      serviceDataId: savedServiceData._id,
    });

  } catch (error) { // Main error handler for the entire submitData function
    const totalErrorTime = Date.now() - overallStartTime;
    logger.error(`[TIMING][${reqIdForLog}] TRANSACTION ABORTED/ERROR for service ${serviceType}. Error: ${error.name} - ${error.message}. Total time before error: ${totalErrorTime}ms.`, {
        stack: error.stack, // Full stack for detailed debugging
        isStorageError: error.isStorageError,
        isTimeoutError: error.isTimeoutError,
        fileDetailsFailed: error.fileDetails,
        originalErrorName: error.originalErrorName,
        cloudinaryHttpCode: error.http_code, // If passed from Cloudinary error
        mongooseValidationErrors: error.name === 'ValidationError' ? error.errors : undefined
    });

    if (session && session.inTransaction()) {
      try {
        await session.abortTransaction();
        logger.info(`[${reqIdForLog}] Transaction successfully aborted on 'rewards' DB.`);
      } catch (abortError) {
        logger.error(`[${reqIdForLog}] Error aborting transaction on 'rewards' DB: ${abortError.message}`, { stack: abortError.stack });
      }
    }

    if (uploadedImageDetails.length > 0) {
      logger.warn(`[${reqIdForLog}] Attempting to clean up ${uploadedImageDetails.length} Cloudinary images due to submission error...`);
      // (Cleanup logic remains the same)
      const cleanupStartTime = Date.now();
      const cleanupPromises = uploadedImageDetails.map(img => {
        if (img && img.cloudinaryId) {
          return storageService.deleteImage(img.cloudinaryId)
            .then(() => logger.info(`[${reqIdForLog}]   Cleaned up image ${img.cloudinaryId}.`))
            .catch(cleanupError => logger.error(`[${reqIdForLog}]   Failed to cleanup image ${img.cloudinaryId}: ${cleanupError.message}`));
        }
        return Promise.resolve();
      });
      Promise.allSettled(cleanupPromises).then(() => {
          logger.info(`[TIMING][${reqIdForLog}] Cloudinary cleanup attempts finished in ${Date.now() - cleanupStartTime}ms.`);
      });
    }
    
    // Refined error responses based on error properties
    if (error.isTimeoutError) { // From our Promise.race timeout
      return res.status(StatusCodes.REQUEST_TIMEOUT).json({ message: error.message });
    }
    if (error.isStorageError) { // From our custom error wrapper for storageService failures
        // The error.message already includes "Upload failed for..." and the specific Cloudinary reason
        return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
    // Kept the original specific checks as fallbacks, though isStorageError should cover most Cloudinary issues now
    if (error.message && error.message.toLowerCase().includes('cloudinary batch upload timeout exceeded')) {
        return res.status(StatusCodes.REQUEST_TIMEOUT).json({ message: 'Image upload took too long and was cancelled. Please try with smaller images or a better connection.' });
    }
    if (error.message && error.message.toLowerCase().includes('upload failed for')) { // From older error structure
        return res.status(StatusCodes.BAD_REQUEST).json({ message: `${error.message}. Please check the file and try again.` });
    }

    if (error.name === 'ValidationError') { // Mongoose validation error
      const errorMessages = Object.values(error.errors).map(e => e.message).join('; ');
      return res.status(StatusCodes.BAD_REQUEST).json({ message: `Validation Error: ${errorMessages}`, errors: error.errors });
    }
    if (error.message && (error.message.includes('Invalid service type') || error.message.includes('model not configured'))) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
    
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Submission failed due to an unexpected internal error. Our team has been notified.' });

  } finally {
    if (session && session.endSession) {
      try {
        await session.endSession();
        logger.info(`[TIMING][${reqIdForLog}] MongoDB session ended for 'rewards' DB connection.`);
      } catch (endSessionError) {
        logger.error(`[TIMING][${reqIdForLog}] Error ending MongoDB session: ${endSessionError.message}`, { stack: endSessionError.stack });
      }
    }
  }
};

// --- getUserSubmissions and getSubmissionDetails remain the same as your previous version ---
// They are well-structured for their purpose.

const getUserSubmissions = async (req, res) => {
  const userId = req.user?.userId;
  const reqIdForLog = userId ? `user-${userId.slice(-6)}-getsubs-${Date.now().toString().slice(-5)}` : `get-user-submissions-${Date.now()}`;
  const { status, page = 1, limit = 10 } = req.query;

  logger.info(`[${reqIdForLog}] Fetching submissions for user ${userId} with status: ${status || 'all'}, page: ${page}, limit: ${limit}`);

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    logger.error(`[${reqIdForLog}] Invalid or missing userId for getUserSubmissions: ${userId}`);
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid user identifier." });
  }

  const CentralSubmission = CentralSubmissionModelModule.getModel();
  if (!CentralSubmission) {
    logger.error(`[${reqIdForLog}] CentralSubmission model is not available in getUserSubmissions.`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Service temporarily unavailable." });
  }

  try {
    const query = { userId: new mongoose.Types.ObjectId(userId) }; 
    if (status && ['pending', 'verified', 'rejected'].includes(status.toLowerCase())) {
      query.status = status.toLowerCase();
    }

    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;
    const skip = (parsedPage - 1) * parsedLimit;

    const submissions = await CentralSubmission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    const totalDocs = await CentralSubmission.countDocuments(query);
    logger.info(`[${reqIdForLog}] Found ${totalDocs} submissions for user ${userId}. Returning ${submissions.length} for page ${parsedPage}.`);

    res.status(StatusCodes.OK).json({
      message: 'Your submissions fetched successfully.',
      data: submissions,
      pagination: {
        totalDocs,
        limit: parsedLimit,
        page: parsedPage,
        totalPages: Math.ceil(totalDocs / parsedLimit),
        hasNextPage: parsedPage * parsedLimit < totalDocs,
        hasPrevPage: parsedPage > 1,
      }
    });
  } catch (error) {
    logger.error(`[${reqIdForLog}] Error fetching user submissions for user ${userId}: ${error.message}`, { stack: error.stack });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch your submissions.' });
  }
};

const getSubmissionDetails = async (req, res) => {
  const { submissionId } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.role;
  const reqIdForLog = userId ? `user-${userId.slice(-6)}-detail-${submissionId.slice(-5)}` : `detail-${submissionId.slice(-5)}-${Date.now().toString().slice(-5)}`;

  logger.info(`[${reqIdForLog}] Fetching details for submission ${submissionId} by user ${userId} (role: ${userRole})`);

  if (!mongoose.Types.ObjectId.isValid(submissionId)) {
    logger.warn(`[${reqIdForLog}] Invalid submission ID format: ${submissionId}`);
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid submission ID format.' });
  }
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    logger.error(`[${reqIdForLog}] Invalid or missing userId from JWT: ${userId}`);
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid user identifier." });
  }

  const CentralSubmission = CentralSubmissionModelModule.getModel();
  if (!CentralSubmission) {
    logger.error(`[${reqIdForLog}] CentralSubmission model is not available.`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Service temporarily unavailable." });
  }

  try {
    const centralSubmission = await CentralSubmission.findById(submissionId).lean();

    if (!centralSubmission) {
      logger.warn(`[${reqIdForLog}] Submission with ID ${submissionId} not found.`);
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Submission not found.' });
    }

    if (userRole !== 'admin' && centralSubmission.userId.toString() !== userId) {
      logger.warn(`[${reqIdForLog}] User ${userId} (role: ${userRole}) unauthorized attempt to access submission ${submissionId} owned by ${centralSubmission.userId}.`);
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'You are not authorized to view this submission.' });
    }

    logger.info(`[${reqIdForLog}] Central submission ${submissionId} found. Fetching service-specific data for type: ${centralSubmission.serviceType}, ID: ${centralSubmission.serviceDataId}`);
    const ServiceModel = getServiceModel(centralSubmission.serviceType);
    if (!ServiceModel) {
      logger.error(`[${reqIdForLog}] Could not get service model for type: "${centralSubmission.serviceType}" (submission ${submissionId}).`);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: `Internal error: Service model for '${centralSubmission.serviceType}' not found.` });
    }
    
    const serviceData = await ServiceModel.findById(centralSubmission.serviceDataId).lean();

    if (!serviceData) {
      logger.error(`[${reqIdForLog}] CRITICAL INCONSISTENCY: Service-specific data not found for central submission ${submissionId} (serviceDataId: ${centralSubmission.serviceDataId}, type: ${centralSubmission.serviceType}).`);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Detailed submission data is missing. This is an internal issue; please contact support.' });
    }
    logger.info(`[${reqIdForLog}] Successfully fetched service-specific data for submission ${submissionId}.`);

    res.status(StatusCodes.OK).json({
      message: 'Submission details fetched successfully.',
      data: {
        ...centralSubmission,
        serviceSpecificData: serviceData,
      },
    });
  } catch (error) {
    logger.error(`[${reqIdForLog}] Error fetching submission details for ID ${submissionId}: ${error.message}`, { stack: error.stack });
    if (error.message.includes('Invalid service type') || error.message.includes('model not found')) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error accessing service data due to internal configuration." });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch submission details.' });
  }
};


module.exports = {
  submitData,
  getUserSubmissions,
  getSubmissionDetails,
};
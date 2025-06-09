// rewards-service/src/services/notification.service.js
const AdminNotificationModelModule = require('../models/AdminNotification.model'); // Import the module
const logger = require('../config/logger');
const authApiService = require('./auth-api.service');

const createAdminNewSubmissionNotification = async (centralSubmission, submissionTitle, userDetailsFromJwt) => {
  const AdminNotification = AdminNotificationModelModule.getModel(); // Get the model instance

  if (!AdminNotification) {
    logger.error("[NotificationService] AdminNotification model is not available. Cannot create admin notification.");
    return;
  }

  try {
    if (!centralSubmission || !centralSubmission._id) {
        logger.error("[NotificationService] Invalid centralSubmission object for admin notification.");
        return;
    }
    if (!userDetailsFromJwt || !userDetailsFromJwt.id || !userDetailsFromJwt.email) {
        logger.warn(`[NotificationService] User details from JWT are incomplete for admin notification (submission ${centralSubmission._id}). Fetching from auth-service.`);
        // Optionally fetch from auth-service if JWT doesn't have enough info, e.g. name
        // const freshUserDetails = await authApiService.getUserDetails(centralSubmission.userId);
        // userDetails = freshUserDetails || userDetailsFromJwt; // Prioritize fresh if available
    }

    const message = `New ${centralSubmission.serviceType} submission: "${submissionTitle || centralSubmission.titlePreview || 'Untitled Submission'}" by ${userDetailsFromJwt?.email}. Needs verification.`;
    
    const notification = await AdminNotification.create({
      type: 'new_submission',
      message: message,
      submissionId: centralSubmission._id,
      userId: userDetailsFromJwt.id, // User who submitted
      userName: userDetailsFromJwt.name || userDetailsFromJwt.email, // userDetailsFromJwt might not have name if not in JWT
      userEmail: userDetailsFromJwt.email,
      serviceType: centralSubmission.serviceType,
      submissionTitlePreview: submissionTitle || centralSubmission.titlePreview || 'Untitled Submission',
      link: `/admin/submissions/pending/${centralSubmission._id}`, // Example specific link
    });
    logger.info(`[NotificationService] Admin notification created: ${notification._id} for submission ${centralSubmission._id}`);
    return notification;
  } catch (error) {
    logger.error(`[NotificationService] Error creating admin new submission notification for ${centralSubmission?._id}: ${error.message}`, { stack: error.stack });
  }
};

const createUserStatusUpdateNotification = async (centralSubmission, statusMessage) => {
  try {
     const userIdentifier = centralSubmission.userEmail || `user ${centralSubmission.userId}`;
     logger.info(
        `[NotificationService] USER NOTIFICATION (Placeholder): Submission ${centralSubmission._id} (Type: ${centralSubmission.serviceType}) for user ${userIdentifier} status updated. Message: "${statusMessage}"`
     );
     // Future: Implement actual user notification (e.g., save to a UserNotification collection, send email/push)
     // Example: if you have a UserNotification model similar to AdminNotification:
     // const UserNotification = UserNotificationModelModule.getModel();
     // await UserNotification.create({ userId: centralSubmission.userId, message: statusMessage, ... });
  } catch (error) {
    logger.error(`[NotificationService] Error preparing user status update notification for submission ${centralSubmission._id}:`, error);
  }
};

/**
 * Creates a notification for an admin when a user redeems a reward.
 * @param {object} redemptionDetails - Details about the redemption from auth-service.
 */
const createRedemptionRequestNotification = async (redemptionDetails) => {
  const AdminNotification = AdminNotificationModelModule.getModel();
  if (!AdminNotification) {
      logger.error("[NotificationService] AdminNotification model is not available.");
      return;
  }

  const { userId, userFullName, userEmail, rewardName } = redemptionDetails;
  if (!userId || !userFullName || !rewardName) {
      logger.error("[NotificationService] Incomplete redemption details received for notification.", redemptionDetails);
      return;
  }

  const message = `"${userFullName}" has requested to redeem the reward: "${rewardName}". Please verify and send the reward.`;

  try {
      const notification = await AdminNotification.create({
          type: 'reward_redemption_request',
          message,
          userId,
          userName: userFullName,
          userEmail,
          link: `/admin/users/${userId}/manage`, // Links directly to the user's admin page
      });
      logger.info(`[NotificationService] Admin notification created for reward redemption by user ${userId}.`);
  } catch (error) {
      logger.error(`[NotificationService] Error creating admin redemption notification for user ${userId}:`, error);
  }
};


const createSpinWinNotification = async (spinDetails) => {
  const AdminNotification = AdminNotificationModelModule.getModel();
  if (!AdminNotification) { /* ... error handling ... */ return; }

  const { userId, userFullName, userEmail, prizeValue } = spinDetails;
  if (!userId || !userFullName || !prizeValue) { /* ... error handling ... */ return; }

  const message = `"${userFullName}" just won "${prizeValue}" from the Spin Wheel!`;
  
  try {
      await AdminNotification.create({
          type: 'spin_wheel_win', // A new, specific type
          message,
          userId,
          userName: userFullName,
          userEmail,
          link: `/admin/users/${userId}/manage`, // Link to user's page
      });
      logger.info(`Admin notification created for spin wheel win by user ${userId}.`);
  } catch (error) {
      logger.error(`Error creating admin spin win notification for user ${userId}:`, error);
  }
};

module.exports = {
createAdminNewSubmissionNotification,
createUserStatusUpdateNotification,
createRedemptionRequestNotification, // <-- EXPORT THE NEW FUNCTION
createSpinWinNotification,
};
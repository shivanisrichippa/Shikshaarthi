// auth-service/src/services/email.service.js
const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../config/logger');

const transporter = nodemailer.createTransport({
  service: config.EMAIL_SERVICE,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD,
  },
});

/**
 * Sends an email.
 * @param {object} options - Email options.
 * @param {string} options.to - Recipient's email address.
 * @param {string} options.subject - Email subject.
 * @param {string} options.text - Plain text body of the email.
 * @param {string} [options.html] - HTML body of the email (optional).
 * @returns {Promise<object>} - Nodemailer response object.
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: `Shikshaarthi Admin <${config.EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    logger.info(`Attempting to send email to ${options.to} with subject "${options.subject}"`);
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email to ${options.to}:`, error);
    throw new Error('Failed to send email.');
  }
};

module.exports = {
  sendEmail,
};
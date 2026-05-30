const Notification = require('../models/Notification');
const socketConfig = require('../config/socket');

/**
 * Creates an in-app notification and pushes it in real-time via Socket.io.
 * @param {Object} params
 * @param {string} params.recipient - User ID of the recipient
 * @param {string} [params.sender] - User ID of the sender (optional)
 * @param {string} params.type - Enum type for the notification
 * @param {string} params.title - Title of the notification
 * @param {string} params.message - Body content of the notification
 * @param {string} [params.relatedRequest] - Associated BloodRequest ID (optional)
 * @returns {Promise<Object>} The saved notification document
 */
const sendNotification = async ({ recipient, sender, type, title, message, relatedRequest }) => {
  try {
    const notification = new Notification({
      recipient,
      sender,
      type,
      title,
      message,
      relatedRequest
    });

    const savedNotification = await notification.save();

    // Push via Socket.IO
    socketConfig.emitToUser(recipient, 'new_notification', savedNotification);

    return savedNotification;
  } catch (error) {
    console.error(`❌ Failed to send notification: ${error.message}`);
    // Don't crash the server, just log the error
    return null;
  }
};

module.exports = sendNotification;

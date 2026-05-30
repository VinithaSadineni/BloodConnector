const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: ['sos_alert', 'donation_request', 'request_accepted', 'request_completed', 'verification', 'stock_alert', 'general'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);

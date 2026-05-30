const mongoose = require('mongoose');

const DonationHistorySchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest' },
  seeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hospitalName: { type: String },
  bloodGroup: { type: String },
  unitsDonated: { type: Number },
  donationDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['completed', 'cancelled'], default: 'completed' }
});

module.exports = mongoose.model('DonationHistory', DonationHistorySchema);

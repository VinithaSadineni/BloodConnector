const mongoose = require('mongoose');

const DonorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  weight: { type: Number },
  lastDonationDate: { type: Date },
  isAvailable: { type: Boolean, default: true },
  isEligible: { type: Boolean, default: true }, // auto-calculated
  totalDonations: { type: Number, default: 0 },
  medicalConditions: [{ type: String }],
  city: { type: String, trim: true },
  verifiedBadge: { type: Boolean, default: false }
});

module.exports = mongoose.model('DonorProfile', DonorProfileSchema);

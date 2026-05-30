const mongoose = require('mongoose');

const HospitalProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  institutionName: { type: String, required: true },
  institutionType: { type: String, enum: ['hospital', 'blood_bank', 'clinic'], required: true },
  registrationNumber: { type: String, trim: true },
  address: { type: String },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  contactPerson: { type: String },
  phone: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  verifiedBadge: { type: Boolean, default: false },
  website: { type: String, trim: true }
});

module.exports = mongoose.model('HospitalProfile', HospitalProfileSchema);

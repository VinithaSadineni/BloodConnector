const mongoose = require('mongoose');

const BloodRequestSchema = new mongoose.Schema({
  seeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
  unitsRequired: { type: Number, required: true },
  urgencyLevel: { type: String, enum: ['critical', 'urgent', 'moderate', 'normal'], default: 'urgent' },
  hospitalName: { type: String },
  hospitalAddress: { type: String },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  contactNumber: { type: String, required: true, trim: true },
  deadline: { type: Date },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'processing', 'completed', 'rejected', 'cancelled'], 
    default: 'pending' 
  },
  isSOSRequest: { type: Boolean, default: false },
  acceptedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // donors who accepted
  additionalNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add 2dsphere index on location
BloodRequestSchema.index({ location: '2dsphere' });

// Pre-save hook to update the updatedAt field
BloodRequestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);

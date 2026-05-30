const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['seeker', 'donor', 'hospital', 'admin'], required: true },
  avatar: { type: String, default: '' },
  address: { type: String, trim: true, default: '' },
  isVerified: { type: Boolean, default: false }, // admin verifies donors/hospitals
  isActive: { type: Boolean, default: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  createdAt: { type: Date, default: Date.now }
});

// Add 2dsphere index on location field
UserSchema.index({ location: '2dsphere' });

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

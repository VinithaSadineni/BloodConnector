const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const HospitalProfile = require('../models/HospitalProfile');
const generateToken = require('../utils/generateToken');
const { validationResult } = require('express-validator');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'An error occurred. Please try again later.' });
  }

  const { name, email, password, role, phone, city, state, lat, lng } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'An error occurred. Please try again later.'
      });
    }

    // Set geo location if provided
    const location = {
      type: 'Point',
      coordinates: lat && lng ? [Number(lng), Number(lat)] : [0, 0]
    };

    // Create user
    user = new User({
      name,
      email,
      password,
      role,
      phone,
      city,
      state,
      location,
      // For testing/convenience, let's make admin automatically verified, others need verification
      isVerified: role === 'admin' || role === 'seeker', 
    });

    await user.save();

    // Create empty profile based on role
    if (role === 'donor') {
      const donorProfile = new DonorProfile({
        user: user._id,
        bloodGroup: req.body.bloodGroup || 'O+', // default O+ if not specified
        age: req.body.age || 18,
        gender: req.body.gender || 'other',
        weight: req.body.weight || 60,
        city: city || '',
        isAvailable: true,
        isEligible: true,
        totalDonations: 0
      });
      await donorProfile.save();
    } else if (role === 'hospital') {
      const hospitalProfile = new HospitalProfile({
        user: user._id,
        // Use hospital-specific fields if provided, otherwise fallback to generic ones
        institutionName: req.body.hospitalName || name,
        institutionType: req.body.institutionType || 'hospital',
        registrationNumber: req.body.licenseNumber || req.body.registrationNumber || '',
        address: req.body.address || '',
        city: city || '',
        state: state || '',
        pincode: req.body.pincode || '',
        contactPerson: req.body.hospitalName || name,
        phone: phone || '',
        email: email || '',
        verificationStatus: 'pending'
      });
      await hospitalProfile.save();
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'An error occurred. Please try again later.' });
  }

  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please try again.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please try again.'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please try again.'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'User logged out successfully. Invalidate your client-side token.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    let profile = null;

    if (user.role === 'donor') {
      profile = await DonorProfile.findOne({ user: user._id });
    } else if (user.role === 'hospital') {
      profile = await HospitalProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    // Check if old password matches
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  changePassword
};

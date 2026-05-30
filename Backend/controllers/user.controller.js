const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const HospitalProfile = require('../models/HospitalProfile');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  const { name, phone, city, state, address, lat, lng, avatar } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (city) user.city = city;
    if (state) user.state = state;
    if (address !== undefined) user.address = address;
    if (avatar !== undefined) user.avatar = avatar;

    if (lat && lng) {
      user.location = {
        type: 'Point',
        coordinates: [Number(lng), Number(lat)]
      };
    }

    await user.save();

    let profile = null;
    if (user.role === 'donor') {
      profile = await DonorProfile.findOne({ user: user._id });
      if (profile) {
        if (req.body.bloodGroup) profile.bloodGroup = req.body.bloodGroup;
        if (req.body.age) profile.age = req.body.age;
        if (req.body.gender) profile.gender = req.body.gender;
        if (req.body.weight) profile.weight = req.body.weight;
        if (req.body.medicalConditions) profile.medicalConditions = req.body.medicalConditions;
        if (city) profile.city = city;
        await profile.save();
      }
    } else if (user.role === 'hospital') {
      profile = await HospitalProfile.findOne({ user: user._id });
      if (profile) {
        if (req.body.institutionName) profile.institutionName = req.body.institutionName;
        if (req.body.institutionType) profile.institutionType = req.body.institutionType;
        if (req.body.registrationNumber) profile.registrationNumber = req.body.registrationNumber;
        if (req.body.address) profile.address = req.body.address;
        if (city) profile.city = city;
        if (state) profile.state = state;
        if (req.body.pincode) profile.pincode = req.body.pincode;
        if (req.body.contactPerson) profile.contactPerson = req.body.contactPerson;
        if (req.body.website) profile.website = req.body.website;
        if (phone) profile.phone = phone;
        await profile.save();
      }
    }

    const updatedUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account (Soft delete / Deactivate account)
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    // Soft delete by setting isActive to false
    const user = await User.findById(req.user.id);
    user.isActive = false;
    await user.save();

    // If donor, mark unavailable
    if (user.role === 'donor') {
      const profile = await DonorProfile.findOne({ user: user._id });
      if (profile) {
        profile.isAvailable = false;
        await profile.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Your account has been deactivated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount
};

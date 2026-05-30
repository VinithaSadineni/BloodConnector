const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const HospitalProfile = require('../models/HospitalProfile');
const BloodRequest = require('../models/BloodRequest');
const DonationHistory = require('../models/DonationHistory');
const sendNotification = require('../utils/sendNotification');

// @desc    Admin dashboard summary stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalSeekers = await User.countDocuments({ role: 'seeker' });
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalHospitals = await User.countDocuments({ role: 'hospital' });

    const totalRequests = await BloodRequest.countDocuments({});
    const pendingRequests = await BloodRequest.countDocuments({ status: 'pending' });
    const completedRequests = await BloodRequest.countDocuments({ status: 'completed' });
    const activeSOS = await BloodRequest.countDocuments({ isSOSRequest: true, status: { $ne: 'completed' } });

    const totalDonations = await DonationHistory.countDocuments({ status: 'completed' });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          seekers: totalSeekers,
          donors: totalDonors,
          hospitals: totalHospitals
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          completed: completedRequests,
          activeSOS
        },
        donations: {
          total: totalDonations
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all users with filters
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { role, city, isVerified, isActive } = req.query;
    const query = {};

    if (role) query.role = role;
    if (city) query.city = new RegExp(city, 'i');
    if (isVerified) query.isVerified = isVerified === 'true';
    if (isActive) query.isActive = isActive === 'true';

    const users = await User.find(query).select('-password').sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user detail
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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

// @desc    Remove/ban user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const banUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft deactivation
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.name} has been banned/deactivated successfully.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify donor or hospital
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin)
const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isVerified = true;
    await user.save();

    let profile = null;
    if (user.role === 'donor') {
      profile = await DonorProfile.findOne({ user: user._id });
      if (profile) {
        profile.verifiedBadge = true;
        await profile.save();
      }
    } else if (user.role === 'hospital') {
      profile = await HospitalProfile.findOne({ user: user._id });
      if (profile) {
        profile.verifiedBadge = true;
        profile.verificationStatus = 'verified';
        await profile.save();
      }
    }

    await sendNotification({
      recipient: user._id,
      type: 'verification',
      title: 'Verification Approved! ✅',
      message: 'Congratulations! Your account has been verified by the administrator.',
    });

    res.status(200).json({
      success: true,
      message: `User ${user.name} verified successfully.`,
      data: { user, profile }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke verification
// @route   PUT /api/admin/users/:id/unverify
// @access  Private (Admin)
const revokeVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isVerified = false;
    await user.save();

    let profile = null;
    if (user.role === 'donor') {
      profile = await DonorProfile.findOne({ user: user._id });
      if (profile) {
        profile.verifiedBadge = false;
        await profile.save();
      }
    } else if (user.role === 'hospital') {
      profile = await HospitalProfile.findOne({ user: user._id });
      if (profile) {
        profile.verifiedBadge = false;
        profile.verificationStatus = 'rejected';
        await profile.save();
      }
    }

    await sendNotification({
      recipient: user._id,
      type: 'verification',
      title: 'Verification Revoked ⚠️',
      message: 'Attention: Your verified badge has been revoked by the administrator.',
    });

    res.status(200).json({
      success: true,
      message: `Verification for ${user.name} revoked successfully.`,
      data: { user, profile }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    All blood requests with filters
// @route   GET /api/admin/requests
// @access  Private (Admin)
const getRequests = async (req, res, next) => {
  try {
    const { status, bloodGroup, city, urgency } = req.query;
    const query = {};

    if (status) query.status = status;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (city) query.city = new RegExp(city, 'i');
    if (urgency) query.urgencyLevel = urgency;

    const requests = await BloodRequest.find(query)
      .populate('seeker', 'name email phone')
      .populate('acceptedBy', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel suspicious request
// @route   PUT /api/admin/requests/:id/cancel
// @access  Private (Admin)
const cancelSuspiciousRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    request.status = 'cancelled';
    request.additionalNotes = `${request.additionalNotes || ''} (Cancelled by Admin: Suspicious activity detected)`.trim();
    await request.save();

    await sendNotification({
      recipient: request.seeker,
      type: 'general',
      title: 'Request Blocked by Admin 🚫',
      message: `Your blood request for ${request.patientName} was cancelled by administrator due to security violations.`,
      relatedRequest: request._id
    });

    res.status(200).json({
      success: true,
      message: 'Blood request cancelled by administrator successfully.',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hospitals awaiting verification
// @route   GET /api/admin/hospitals/pending
// @access  Private (Admin)
const getPendingHospitals = async (req, res, next) => {
  try {
    const pendingHospitals = await HospitalProfile.find({
      verificationStatus: 'pending'
    }).populate('user', 'name email phone isActive');

    res.status(200).json({
      success: true,
      count: pendingHospitals.length,
      data: pendingHospitals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve hospital/blood bank
// @route   PUT /api/admin/hospitals/:id/verify
// @access  Private (Admin)
const verifyHospital = async (req, res, next) => {
  try {
    const profile = await HospitalProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Hospital profile not found'
      });
    }

    profile.verificationStatus = 'verified';
    profile.verifiedBadge = true;
    await profile.save();

    // Verify corresponding user
    const user = await User.findById(profile.user);
    if (user) {
      user.isVerified = true;
      await user.save();
    }

    await sendNotification({
      recipient: profile.user,
      type: 'verification',
      title: 'Hospital Verified! 🏥',
      message: `Your medical institution ${profile.institutionName} is verified. You can now coordinate emergency blood requests!`,
    });

    res.status(200).json({
      success: true,
      message: 'Hospital verified and approved successfully.',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject hospital
// @route   PUT /api/admin/hospitals/:id/reject
// @access  Private (Admin)
const rejectHospital = async (req, res, next) => {
  try {
    const profile = await HospitalProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Hospital profile not found'
      });
    }

    profile.verificationStatus = 'rejected';
    profile.verifiedBadge = false;
    await profile.save();

    // Revoke corresponding user verification
    const user = await User.findById(profile.user);
    if (user) {
      user.isVerified = false;
      await user.save();
    }

    await sendNotification({
      recipient: profile.user,
      type: 'verification',
      title: 'Verification Request Declined ❌',
      message: `Verification for ${profile.institutionName} has been declined. Please review information or contact support.`,
    });

    res.status(200).json({
      success: true,
      message: 'Hospital verification rejected.',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Full analytical reports
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAnalytics = async (req, res, next) => {
  try {
    // 1. User breakdown by Role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // 2. Requests by Blood Group
    const requestsByBlood = await BloodRequest.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
    ]);

    // 3. Requests by City
    const requestsByCity = await BloodRequest.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 4. Requests by Status
    const requestsByStatus = await BloodRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 5. Total completed donations
    const completedDonationsCount = await DonationHistory.countDocuments({ status: 'completed' });

    res.status(200).json({
      success: true,
      data: {
        usersByRole,
        requestsByBlood,
        requestsByCity,
        requestsByStatus,
        completedDonationsCount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getUserById,
  banUser,
  verifyUser,
  revokeVerification,
  getRequests,
  cancelSuspiciousRequest,
  getPendingHospitals,
  verifyHospital,
  rejectHospital,
  getAnalytics
};

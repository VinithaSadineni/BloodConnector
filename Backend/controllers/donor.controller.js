const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const BloodRequest = require('../models/BloodRequest');
const DonationHistory = require('../models/DonationHistory');
const sendNotification = require('../utils/sendNotification');
const checkEligibility = require('../utils/eligibilityCheck');
const socketConfig = require('../config/socket');
const { validationResult } = require('express-validator');

// @desc    Create donor profile (for post-registration)
// @route   POST /api/donor/profile
// @access  Private (Donor)
const createDonorProfile = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { bloodGroup, age, gender, weight, medicalConditions, city } = req.body;

  try {
    let profile = await DonorProfile.findOne({ user: req.user.id });
    if (profile) {
      return res.status(400).json({
        success: false,
        message: 'Donor profile already exists'
      });
    }

    profile = new DonorProfile({
      user: req.user.id,
      bloodGroup,
      age,
      gender,
      weight,
      medicalConditions: medicalConditions || [],
      city: city || req.user.city,
      isAvailable: true,
      isEligible: true
    });

    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Donor profile created successfully',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get own donor profile
// @route   GET /api/donor/profile
// @access  Private (Donor)
const getDonorProfile = async (req, res, next) => {
  try {
    const profile = await DonorProfile.findOne({ user: req.user.id }).populate('user', 'name email phone avatar location');
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update donor profile
// @route   PUT /api/donor/profile
// @access  Private (Donor)
const updateDonorProfile = async (req, res, next) => {
  const { bloodGroup, age, gender, weight, medicalConditions, city } = req.body;

  try {
    let profile = await DonorProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found. Please create one first.'
      });
    }

    if (bloodGroup) profile.bloodGroup = bloodGroup;
    if (age) profile.age = age;
    if (gender) profile.gender = gender;
    if (weight) profile.weight = weight;
    if (medicalConditions !== undefined) profile.medicalConditions = medicalConditions;
    if (city) profile.city = city;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Donor profile updated successfully',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle availability
// @route   PUT /api/donor/availability
// @access  Private (Donor)
const toggleAvailability = async (req, res, next) => {
  const { isAvailable } = req.body;

  try {
    const profile = await DonorProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found'
      });
    }

    profile.isAvailable = isAvailable !== undefined ? isAvailable : !profile.isAvailable;
    await profile.save();

    res.status(200).json({
      success: true,
      message: `Availability set to ${profile.isAvailable ? 'available' : 'unavailable'}`,
      data: { isAvailable: profile.isAvailable }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get emergency requests near donor location
// @route   GET /api/donor/nearby-requests
// @access  Private (Donor)
const getNearbyRequests = async (req, res, next) => {
  try {
    let profile = await DonorProfile.findOne({ user: req.user.id });
    // If no profile, we can still search by user city (if set) or return empty list
    if (!profile) {
      // Fallback: use city from user record if available
      const fallbackCity = req.user.city || null;
      profile = { bloodGroup: null, city: fallbackCity };
    }

    const maxDistance = req.query.radius ? Number(req.query.radius) * 1000 : 50000; // default 50km in meters
    const query = {
      status: 'pending'
    };
    // If we have a blood group from profile, filter by it
    if (profile.bloodGroup) {
      query.bloodGroup = profile.bloodGroup;
    }

    // Geospatial query if user location is available
    if (
      req.user.location &&
      req.user.location.coordinates &&
      req.user.location.coordinates[0] !== 0 &&
      req.user.location.coordinates[1] !== 0
    ) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: req.user.location.coordinates
          },
          $maxDistance: maxDistance
        }
      };
        } else if (profile.city) {
      // Fallback search by city from profile or user
      query.city = new RegExp(`^${profile.city}$`, 'i');
    }

    const requests = await BloodRequest.find(query)
      .populate('seeker', 'name email phone avatar')
      .limit(10);

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get requests assigned to/accepted by donor
// @route   GET /api/donor/requests
// @access  Private (Donor)
const getAssignedRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.find({
      acceptedBy: req.user.id,
      status: { $in: ['accepted', 'processing'] }
    }).populate('seeker', 'name email phone avatar');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept donation request
// @route   PUT /api/donor/requests/:id/accept
// @access  Private (Donor)
const acceptRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    if (request.status !== 'pending' && request.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept request. Current status is ${request.status}`
      });
    }

    // Check donor eligibility
    const profile = await DonorProfile.findOne({ user: req.user.id });
    if (!profile || !profile.isEligible) {
      return res.status(400).json({
        success: false,
        message: 'You are currently not eligible to donate. Wait 56 days between donations.'
      });
    }

    // Prevent accepting multiple times
    if (request.acceptedBy.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already accepted this blood request'
      });
    }

    // Add donor and update status
    request.acceptedBy.push(req.user.id);
    request.status = 'accepted';
    await request.save();

    // Notify seeker in-app + socket
    await sendNotification({
      recipient: request.seeker,
      sender: req.user.id,
      type: 'request_accepted',
      title: 'Donation Request Accepted',
      message: `Great news! Donor ${req.user.name} has accepted your blood request for ${request.patientName}.`,
      relatedRequest: request._id
    });

    // Emit 'request_accepted' socket event to seeker
    socketConfig.emitToUser(request.seeker, 'request_accepted', {
      message: `Donor ${req.user.name} has accepted your request.`,
      request,
      donor: { name: req.user.name, phone: req.user.phone }
    });

    res.status(200).json({
      success: true,
      message: 'Request accepted successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject donation request (Remove acceptance / Refuse match)
// @route   PUT /api/donor/requests/:id/reject
// @access  Private (Donor)
const rejectRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // If accepted previously, remove from accepted list
    const index = request.acceptedBy.indexOf(req.user.id);
    if (index > -1) {
      request.acceptedBy.splice(index, 1);
      
      // If no other donor has accepted, set back to pending
      if (request.acceptedBy.length === 0) {
        request.status = 'pending';
      }
      await request.save();

      // Notify seeker
      await sendNotification({
        recipient: request.seeker,
        sender: req.user.id,
        type: 'general',
        title: 'Donor Opted Out',
        message: `Donor ${req.user.name} who accepted your request has opted out.`,
        relatedRequest: request._id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rejection/opt-out acknowledged successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark donation as completed
// @route   PUT /api/donor/requests/:id/complete
// @access  Private (Donor)
const completeDonation = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    if (request.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Blood request is already completed'
      });
    }

    // Ensure only an accepting donor (or admin/seeker) can mark it complete. 
    // In our rules, the donor who accepted completes it.
    if (!request.acceptedBy.includes(req.user.id) && request.seeker.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this donation as completed'
      });
    }

    // 1. Update BloodRequest Status
    request.status = 'completed';
    await request.save();

    // 2. Create Donation History
    const history = new DonationHistory({
      donor: req.user.id,
      request: request._id,
      seeker: request.seeker,
      hospitalName: request.hospitalName || 'Unspecified Hospital',
      bloodGroup: request.bloodGroup,
      unitsDonated: request.unitsRequired,
      donationDate: new Date(),
      status: 'completed'
    });
    await history.save();

    // 3. Update Donor Profile details
    const donorProfile = await DonorProfile.findOne({ user: req.user.id });
    if (donorProfile) {
      donorProfile.lastDonationDate = new Date();
      donorProfile.totalDonations += 1;
      
      // Calculate eligibility (will set isEligible to false since 0 days passed)
      donorProfile.isEligible = checkEligibility(donorProfile.lastDonationDate);
      await donorProfile.save();
    }

    // 4. Notify Seeker in-app + socket
    await sendNotification({
      recipient: request.seeker,
      sender: req.user.id,
      type: 'request_completed',
      title: 'Donation Completed! 🎉',
      message: `Donor ${req.user.name} has completed the blood donation for ${request.patientName}. Thank you!`,
      relatedRequest: request._id
    });

    socketConfig.emitToUser(request.seeker, 'request_status_update', {
      message: `Your request for ${request.patientName} has been marked completed by donor.`,
      request
    });

    res.status(200).json({
      success: true,
      message: 'Donation marked as completed successfully',
      data: {
        request,
        history
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donation history
// @route   GET /api/donor/history
// @access  Private (Donor)
const getDonationHistory = async (req, res, next) => {
  try {
    const history = await DonationHistory.find({ donor: req.user.id })
      .populate('seeker', 'name email phone')
      .sort('-donationDate');

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donor dashboard stats
// @route   GET /api/donor/dashboard
// @access  Private (Donor)
const getDashboardStats = async (req, res, next) => {
  try {
    const profile = await DonorProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found'
      });
    }

    const totalDonations = profile.totalDonations;
    const isEligible = profile.isEligible;
    
    // Calculate next eligible date
    let nextEligibleDate = null;
    if (profile.lastDonationDate) {
      const lastDate = new Date(profile.lastDonationDate);
      nextEligibleDate = new Date(lastDate.setDate(lastDate.getDate() + 56));
    }

    const activeAssigned = await BloodRequest.countDocuments({
      acceptedBy: req.user.id,
      status: { $in: ['accepted', 'processing'] }
    });

    const recentDonations = await DonationHistory.find({ donor: req.user.id })
      .sort('-donationDate')
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalDonations,
          isEligible,
          nextEligibleDate,
          isAvailable: profile.isAvailable,
          verifiedBadge: profile.verifiedBadge,
          activeAssigned
        },
        recentDonations
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDonorProfile,
  getDonorProfile,
  updateDonorProfile,
  toggleAvailability,
  getNearbyRequests,
  getAssignedRequests,
  acceptRequest,
  rejectRequest,
  completeDonation,
  getDonationHistory,
  getDashboardStats
};

const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const HospitalProfile = require('../models/HospitalProfile');
const sendNotification = require('../utils/sendNotification');
const socketConfig = require('../config/socket');
const { validationResult } = require('express-validator');

// @desc    Create a blood request
// @route   POST /api/seeker/requests
// @access  Private (Seeker)
const createRequest = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const {
    patientName,
    bloodGroup,
    unitsRequired,
    urgencyLevel,
    hospitalName,
    hospitalAddress,
    city,
    state,
    lat,
    lng,
    contactNumber,
    deadline,
    isSOSRequest,
    additionalNotes
  } = req.body;

  try {
    const coordinates = lat && lng ? [Number(lng), Number(lat)] : [0, 0];

    const request = new BloodRequest({
      seeker: req.user.id,
      patientName,
      bloodGroup,
      unitsRequired,
      urgencyLevel,
      hospitalName,
      hospitalAddress,
      city,
      state,
      location: {
        type: 'Point',
        coordinates
      },
      contactNumber,
      deadline,
      isSOSRequest,
      additionalNotes
    });

    const savedRequest = await request.save();

    // If SOS, trigger real-time alerts
    if (isSOSRequest) {
      await triggerSOSAlerts(savedRequest, req.user.id);
    } else {
      // Create notification for nearby hospitals/blood banks in the same city
      await notifyCityHospitals(savedRequest, req.user.id);
    }

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: savedRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get own blood requests
// @route   GET /api/seeker/requests
// @access  Private (Seeker)
const getRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.find({ seeker: req.user.id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single request detail
// @route   GET /api/seeker/requests/:id
// @access  Private (Seeker)
const getRequestById = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('seeker', 'name email phone')
      .populate('acceptedBy', 'name email phone');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Verify ownership
    if (request.seeker._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this request'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blood request
// @route   PUT /api/seeker/requests/:id
// @access  Private (Seeker)
const updateRequest = async (req, res, next) => {
  try {
    let request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Verify ownership
    if (request.seeker.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    // Allow updates only if pending or accepted
    if (['completed', 'rejected', 'cancelled'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update a request that is already ${request.status}`
      });
    }

    const { lat, lng } = req.body;
    if (lat && lng) {
      req.body.location = {
        type: 'Point',
        coordinates: [Number(lng), Number(lat)]
      };
    }

    request = await BloodRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Request updated successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel blood request
// @route   DELETE /api/seeker/requests/:id
// @access  Private (Seeker)
const cancelRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Verify ownership
    if (request.seeker.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this request'
      });
    }

    if (request.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed blood request'
      });
    }

    request.status = 'cancelled';
    await request.save();

    // Notify any accepted donors that request is cancelled
    if (request.acceptedBy && request.acceptedBy.length > 0) {
      for (const donorId of request.acceptedBy) {
        await sendNotification({
          recipient: donorId,
          sender: req.user.id,
          type: 'general',
          title: 'Request Cancelled',
          message: `The blood request for ${request.patientName} that you accepted has been cancelled by the seeker.`,
          relatedRequest: request._id
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Blood request cancelled successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Escalate blood request to SOS
// @route   POST /api/seeker/requests/:id/sos
// @access  Private (Seeker)
const escalateToSOS = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Verify ownership
    if (request.seeker.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to escalate this request'
      });
    }

    if (request.status !== 'pending' && request.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Cannot escalate to SOS. Current status is ${request.status}`
      });
    }

    request.isSOSRequest = true;
    request.urgencyLevel = 'critical';
    await request.save();

    // Trigger SOS real-time broadcast and alerts
    await triggerSOSAlerts(request, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Blood request escalated to SOS successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seeker dashboard stats
// @route   GET /api/seeker/dashboard
// @access  Private (Seeker)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalRequests = await BloodRequest.countDocuments({ seeker: req.user.id });
    const pendingRequests = await BloodRequest.countDocuments({ seeker: req.user.id, status: 'pending' });
    const processingRequests = await BloodRequest.countDocuments({ seeker: req.user.id, status: 'processing' });
    const completedRequests = await BloodRequest.countDocuments({ seeker: req.user.id, status: 'completed' });
    const sosRequests = await BloodRequest.countDocuments({ seeker: req.user.id, isSOSRequest: true, status: { $ne: 'completed' } });
    // New: fetch user profile details
    const user = await User.findById(req.user.id).select('-password');

    const recentRequests = await BloodRequest.find({ seeker: req.user.id })
      .sort('-createdAt')
      .limit(5)
      .populate('acceptedBy', 'name phone');

    // Respond with dashboard stats plus user profile
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalRequests,
          pendingRequests,
          processingRequests,
          completedRequests,
          sosRequests
        },
        recentRequests,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// NEW: Get seeker profile (basic user info)
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, profile: user });
  } catch (error) {
    next(error);
  }
};

// HELPER: Broadcast and notify hospitals and donors about SOS
const triggerSOSAlerts = async (request, seekerId) => {
  const city = request.city ? request.city.trim().toLowerCase() : '';
  
  // 1. Socket emit 'new_sos_alert' to city room
  socketConfig.emitToCity(request.city, 'new_sos_alert', {
    message: `🚨 EMERGENCY SOS! Critical need for ${request.bloodGroup} blood at ${request.hospitalName || 'Local Hospital'}.`,
    request
  });

  // 2. Socket emit 'emergency_broadcast' to city room for all users
  socketConfig.emitToCity(request.city, 'emergency_broadcast', {
    type: 'sos_alert',
    message: `🚨 URGENT: A critical SOS alert has been triggered in your city. Blood Group: ${request.bloodGroup} needed immediately!`,
    request
  });

  // 3. Find and notify all registered verified hospitals in the same city
  if (request.city) {
    const cityHospitals = await User.find({
      role: 'hospital',
      city: new RegExp(`^${request.city}$`, 'i'),
      isActive: true
    });

    for (const hospital of cityHospitals) {
      await sendNotification({
        recipient: hospital._id,
        sender: seekerId,
        type: 'sos_alert',
        title: '🚨 CRITICAL SOS ALERT',
        message: `An emergency SOS blood request is active in your city: ${request.bloodGroup} blood needed immediately for ${request.patientName}.`,
        relatedRequest: request._id
      });
    }

    // 4. Find all active and available donors in the same city with matching blood group and notify them
    const matchingDonors = await User.find({
      role: 'donor',
      city: new RegExp(`^${request.city}$`, 'i'),
      isActive: true
    });

    for (const donor of matchingDonors) {
      // Verify if donor has matching blood group
      // For O-, O+, A+, etc. We can do exact or general match. For simplicity, match exact first.
      await sendNotification({
        recipient: donor._id,
        sender: seekerId,
        type: 'sos_alert',
        title: '🚨 EMERGENCY SOS ALERT',
        message: `Urgent! Someone in your city needs ${request.bloodGroup} blood. Can you help?`,
        relatedRequest: request._id
      });
    }
  }
};

// HELPER: Notify hospitals in same city of a standard blood request
const notifyCityHospitals = async (request, seekerId) => {
  if (request.city) {
    const cityHospitals = await User.find({
      role: 'hospital',
      city: new RegExp(`^${request.city}$`, 'i'),
      isActive: true
    });

    for (const hospital of cityHospitals) {
      await sendNotification({
        recipient: hospital._id,
        sender: seekerId,
        type: 'donation_request',
        title: 'New Blood Request',
        message: `New standard blood request created in your city: ${request.bloodGroup} for ${request.patientName}.`,
        relatedRequest: request._id
      });
    }
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  cancelRequest,
  escalateToSOS,
  getDashboardStats,
  // New: Get seeker profile information
  getProfile
};

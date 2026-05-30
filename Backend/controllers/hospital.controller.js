const User = require('../models/User');
const HospitalProfile = require('../models/HospitalProfile');
const BloodStock = require('../models/BloodStock');
const BloodRequest = require('../models/BloodRequest');
const sendNotification = require('../utils/sendNotification');
const socketConfig = require('../config/socket');
const { validationResult } = require('express-validator');

// @desc    Create hospital profile
// @route   POST /api/hospital/profile
// @access  Private (Hospital)
const createHospitalProfile = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { institutionName, institutionType, registrationNumber, address, city, state, pincode, contactPerson, website } = req.body;

  try {
    let profile = await HospitalProfile.findOne({ user: req.user.id });
    if (profile) {
      return res.status(400).json({
        success: false,
        message: 'Hospital profile already exists'
      });
    }

    profile = new HospitalProfile({
      user: req.user.id,
      institutionName,
      institutionType,
      registrationNumber,
      address,
      city: city || req.user.city,
      state: state || req.user.state,
      pincode,
      contactPerson,
      phone: req.user.phone,
      email: req.user.email,
      website
    });

    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Hospital profile created successfully',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get own hospital profile
// @route   GET /api/hospital/profile
// @access  Private (Hospital)
const getHospitalProfile = async (req, res, next) => {
  try {
    const profile = await HospitalProfile.findOne({ user: req.user.id }).populate('user', 'name email phone avatar location');
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Hospital profile not found'
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

// @desc    Update hospital profile
// @route   PUT /api/hospital/profile
// @access  Private (Hospital)
const updateHospitalProfile = async (req, res, next) => {
  const { institutionName, institutionType, registrationNumber, address, city, state, pincode, contactPerson, website } = req.body;

  try {
    let profile = await HospitalProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Hospital profile not found. Please create one first.'
      });
    }

    if (institutionName) profile.institutionName = institutionName;
    if (institutionType) profile.institutionType = institutionType;
    if (registrationNumber) profile.registrationNumber = registrationNumber;
    if (address) profile.address = address;
    if (city) profile.city = city;
    if (state) profile.state = state;
    if (pincode) profile.pincode = pincode;
    if (contactPerson) profile.contactPerson = contactPerson;
    if (website) profile.website = website;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Hospital profile updated successfully',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit verification request to admin
// @route   POST /api/hospital/verify-request
// @access  Private (Hospital)
const submitVerificationRequest = async (req, res, next) => {
  try {
    const profile = await HospitalProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Hospital profile not found'
      });
    }

    profile.verificationStatus = 'pending';
    await profile.save();

    // Find admin users to notify
    const admins = await User.find({ role: 'admin', isActive: true });
    for (const admin of admins) {
      await sendNotification({
        recipient: admin._id,
        sender: req.user.id,
        type: 'verification',
        title: 'New Verification Request',
        message: `Institution ${profile.institutionName} has submitted a verification request.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification request submitted to administrators successfully.',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get own blood stock
// @route   GET /api/hospital/blood-stock
// @access  Private (Hospital)
const getBloodStock = async (req, res, next) => {
  try {
    const stock = await BloodStock.find({ hospital: req.user.id });
    res.status(200).json({
      success: true,
      count: stock.length,
      data: stock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or Update blood stock entry (Upsert)
// @route   POST /api/hospital/blood-stock
// @access  Private (Hospital)
const addBloodStock = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'An error occurred. Please try again later.' });
  }

  let { bloodGroup, availableUnits } = req.body;
  if (!bloodGroup) {
    // Fallback to alternative field name
    bloodGroup = req.body.blood_group;
  }
  if (!bloodGroup) {
    return res.status(400).json({ success: false, message: 'An error occurred. Please try again later.' });
  }
  bloodGroup = bloodGroup.toUpperCase();

  const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (!validGroups.includes(bloodGroup)) {
    return res.status(400).json({ success: false, message: 'An error occurred. Please try again later.' });
  }

  try {
    let stock = await BloodStock.findOne({
      hospital: req.user.id,
      bloodGroup
    });

    if (stock) {
      stock.availableUnits = availableUnits;
      stock.lastUpdated = new Date();
      await stock.save();
    } else {
      stock = new BloodStock({
        hospital: req.user.id,
        bloodGroup,
        availableUnits
      });
      await stock.save();
    }

    // Trigger Socket.io broadcast to city room
    socketConfig.emitToCity(req.user.city, 'blood_stock_update', {
      hospitalId: req.user.id,
      hospitalName: req.user.name,
      bloodGroup,
      availableUnits,
      lastUpdated: stock.lastUpdated
    });

    res.status(200).json({
      success: true,
      message: 'Blood stock saved successfully',
      data: stock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update units for a blood group
// @route   PUT /api/hospital/blood-stock/:bloodGroup
// @access  Private (Hospital)
const updateBloodStock = async (req, res, next) => {
  let { bloodGroup } = req.params;
  const { availableUnits } = req.body;

  if (!bloodGroup) {
    // support alternative param name
    bloodGroup = req.params.blood_group;
  }
  if (!bloodGroup) {
    return res.status(400).json({ success: false, message: 'An error occurred. Please try again later.' });
  }
  const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (!validGroups.includes(bloodGroup.toUpperCase())) {
    return res.status(400).json({ success: false, message: 'An error occurred. Please try again later.' });
  }

  if (availableUnits === undefined || availableUnits < 0) {
    return res.status(400).json({
      success: false,
      message: 'An error occurred. Please try again later.'
    });
  }

  try {
    let stock = await BloodStock.findOne({
      hospital: req.user.id,
      bloodGroup: bloodGroup.toUpperCase()
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: `No blood stock record found for group ${bloodGroup}`
      });
    }

    stock.availableUnits = availableUnits;
    stock.lastUpdated = new Date();
    await stock.save();

    // Trigger Socket.io broadcast to city room
    socketConfig.emitToCity(req.user.city, 'blood_stock_update', {
      hospitalId: req.user.id,
      hospitalName: req.user.name,
      bloodGroup: bloodGroup.toUpperCase(),
      availableUnits,
      lastUpdated: stock.lastUpdated
    });

    res.status(200).json({
      success: true,
      message: 'Blood stock updated successfully',
      data: stock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove blood group entry
// @route   DELETE /api/hospital/blood-stock/:bloodGroup
// @access  Private (Hospital)
const removeBloodStock = async (req, res, next) => {
  const { bloodGroup } = req.params;

  try {
    const result = await BloodStock.findOneAndDelete({
      hospital: req.user.id,
      bloodGroup: bloodGroup.toUpperCase()
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `No blood stock record found to remove for group ${bloodGroup}`
      });
    }

    // Trigger Socket.io broadcast to city room (set to 0)
    socketConfig.emitToCity(req.user.city, 'blood_stock_update', {
      hospitalId: req.user.id,
      hospitalName: req.user.name,
      bloodGroup: bloodGroup.toUpperCase(),
      availableUnits: 0,
      lastUpdated: new Date()
    });

    res.status(200).json({
      success: true,
      message: `Blood stock entry for group ${bloodGroup} removed successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get emergency requests in same city
// @route   GET /api/hospital/requests
// @access  Private (Hospital)
const getCityRequests = async (req, res, next) => {
  try {
    const query = {
      status: { $in: ['pending', 'accepted', 'processing'] }
    };

    if (req.user.city) {
      query.city = new RegExp(`^${req.user.city}$`, 'i');
    }

    const requests = await BloodRequest.find(query)
      .populate('seeker', 'name email phone')
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

// @desc    Approve/Coordinate blood request
// @route   PUT /api/hospital/requests/:id/approve
// @access  Private (Hospital)
const approveRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Load hospital profile to get institution name
    const profile = await HospitalProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Hospital profile not found'
      });
    }

    // Ensure hospital is verified to approve/coordinate
    if (profile.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Your hospital account must be verified by admin before coordinating requests.'
      });
    }

    request.status = 'processing';
    request.hospitalName = profile.institutionName;
    request.hospitalAddress = profile.address;
    await request.save();

    // Notify seeker
    await sendNotification({
      recipient: request.seeker,
      sender: req.user.id,
      type: 'request_accepted',
      title: 'Hospital Coordination Approved',
      message: `Your blood request for ${request.patientName} is now being coordinated by ${profile.institutionName}.`,
      relatedRequest: request._id
    });

    socketConfig.emitToUser(request.seeker, 'request_status_update', {
      message: `Your request has been approved for coordination by ${profile.institutionName}`,
      request
    });

    res.status(200).json({
      success: true,
      message: 'Blood request approval/coordination registered successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject coordination of request
// @route   PUT /api/hospital/requests/:id/reject
// @access  Private (Hospital)
const rejectRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Load hospital profile
    const profile = await HospitalProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Hospital profile not found'
      });
    }

    // Ensure this hospital is currently coordinating the request
    if (request.status !== 'processing' || request.hospitalName !== profile.institutionName) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject a request not coordinated by your hospital'
      });
    }

    // Reset coordination
    request.status = 'pending';
    request.hospitalName = '';
    request.hospitalAddress = '';
    await request.save();

    // Notify seeker
    await sendNotification({
      recipient: request.seeker,
      sender: req.user.id,
      type: 'general',
      title: 'Coordination Opt-Out',
      message: `Hospital ${profile.institutionName} has opted out of coordinating your blood request.`,
      relatedRequest: request._id
    });

    res.status(200).json({
      success: true,
      message: 'Coordination opt-out recognized successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hospital dashboard stats
// @route   GET /api/hospital/dashboard
// @access  Private (Hospital)
const getDashboardStats = async (req, res, next) => {
  try {
    const profile = await HospitalProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Hospital profile not found'
      });
    }

    // Aggregate blood stock total units
    const stockDetails = await BloodStock.find({ hospital: req.user.id });
    let totalStockUnits = 0;
    stockDetails.forEach(s => totalStockUnits += s.availableUnits);

    const query = {};
    if (req.user.city) {
      query.city = new RegExp(`^${req.user.city}$`, 'i');
    }
    query.status = 'pending';

    const activeCityRequestsCount = await BloodRequest.countDocuments(query);

    const coordinatedRequestsCount = await BloodRequest.countDocuments({
      hospitalName: profile.institutionName,
      status: 'processing'
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          verificationStatus: profile.verificationStatus,
          verifiedBadge: profile.verifiedBadge,
          totalStockUnits,
          activeCityRequestsCount,
          coordinatedRequestsCount
        },
        bloodStock: stockDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHospitalProfile,
  getHospitalProfile,
  updateHospitalProfile,
  submitVerificationRequest,
  getBloodStock,
  addBloodStock,
  updateBloodStock,
  removeBloodStock,
  getCityRequests,
  approveRequest,
  rejectRequest,
  getDashboardStats
};

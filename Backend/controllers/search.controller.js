const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const HospitalProfile = require('../models/HospitalProfile');
const BloodStock = require('../models/BloodStock');
const BloodRequest = require('../models/BloodRequest');

// @desc    Search available donors
// @route   GET /api/search/donors
// @access  Public
const searchDonors = async (req, res, next) => {
  try {
    const { bloodGroup, city, lat, lng, radius } = req.query;
    const userQuery = { role: 'donor', isActive: true };

    if (city) {
      userQuery.city = new RegExp(`^${city.trim()}$`, 'i');
    }

    // Geolocation query
    if (lat && lng) {
      const rad = radius ? Number(radius) * 1000 : 50000; // default 50km
      userQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: rad
        }
      };
    }

    const users = await User.find(userQuery).select('-password');
    const userIds = users.map(u => u._id);

    const profileQuery = { 
      user: { $in: userIds }, 
      isAvailable: true, 
      isEligible: true 
    };

    if (bloodGroup) {
      profileQuery.bloodGroup = bloodGroup.toUpperCase();
    }

    const profiles = await DonorProfile.find(profileQuery)
      .populate('user', 'name email phone avatar location city state');

    res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search hospitals/blood banks
// @route   GET /api/search/hospitals
// @access  Public
const searchHospitals = async (req, res, next) => {
  try {
    const { city, type, bloodGroup } = req.query;
    const profileQuery = { verificationStatus: 'verified' }; // Only verified

    if (city) {
      profileQuery.city = new RegExp(`^${city.trim()}$`, 'i');
    }
    if (type) {
      profileQuery.institutionType = type;
    }

    const profiles = await HospitalProfile.find(profileQuery)
      .populate('user', 'name email phone location avatar');

    let filteredProfiles = profiles;

    // Filter by stock if bloodGroup specified
    if (bloodGroup) {
      const hospitalUserIds = profiles.map(p => p.user._id);
      const stocks = await BloodStock.find({
        hospital: { $in: hospitalUserIds },
        bloodGroup: bloodGroup.toUpperCase(),
        availableUnits: { $gt: 0 }
      });

      const hospitalsWithStock = stocks.map(s => s.hospital.toString());
      filteredProfiles = profiles.filter(p => hospitalsWithStock.includes(p.user._id.toString()));
    }

    // Fetch blood stock for each hospital
    const hospitalsWithStock = await Promise.all(
      filteredProfiles.map(async (profile) => {
        const stock = await BloodStock.find({ hospital: profile.user._id });
        return {
          ...profile.toObject(),
          stock: stock.map(s => ({
            bloodGroup: s.bloodGroup,
            availableUnits: s.availableUnits
          }))
        };
      })
    );

    res.status(200).json({
      success: true,
      count: hospitalsWithStock.length,
      data: hospitalsWithStock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search blood stock availability
// @route   GET /api/search/blood-stock
// @access  Public
const searchBloodStock = async (req, res, next) => {
  try {
    const { bloodGroup, city } = req.query;
    const stockQuery = { availableUnits: { $gt: 0 } };

    if (bloodGroup) {
      stockQuery.bloodGroup = bloodGroup.toUpperCase();
    }

    if (city) {
      const hospitalsInCity = await User.find({
        role: 'hospital',
        city: new RegExp(`^${city.trim()}$`, 'i'),
        isActive: true
      });
      const hospitalIds = hospitalsInCity.map(h => h._id);
      stockQuery.hospital = { $in: hospitalIds };
    }

    const stocks = await BloodStock.find(stockQuery)
      .populate('hospital', 'name email phone city state location');

    res.status(200).json({
      success: true,
      count: stocks.length,
      data: stocks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Public active emergency requests
// @route   GET /api/search/requests
// @access  Public
const searchRequests = async (req, res, next) => {
  try {
    const { status, bloodGroup, city, urgency } = req.query;
    
    // Default to active requests if status is not provided
    const query = { 
      status: status || { $in: ['pending', 'accepted', 'processing'] } 
    };

    if (bloodGroup) {
      query.bloodGroup = bloodGroup.toUpperCase();
    }
    if (city) {
      query.city = new RegExp(`^${city.trim()}$`, 'i');
    }
    if (urgency) {
      query.urgencyLevel = urgency;
    }

    const requests = await BloodRequest.find(query)
      .populate('seeker', 'name avatar')
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

module.exports = {
  searchDonors,
  searchHospitals,
  searchBloodStock,
  searchRequests
};

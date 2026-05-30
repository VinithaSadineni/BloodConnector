const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/hospital.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const router = express.Router();

router.use(protect);
router.use(requireRole('hospital', 'admin')); // Hospital and admin roles allowed

// Profile validation
const profileValidation = [
  body('institutionName').notEmpty().withMessage('Institution name is required').trim(),
  body('institutionType').isIn(['hospital', 'blood_bank', 'clinic']).withMessage('Institution type must be hospital, blood_bank, or clinic'),
  body('address').notEmpty().withMessage('Address is required').trim(),
  body('city').notEmpty().withMessage('City is required').trim(),
  body('state').notEmpty().withMessage('State is required').trim(),
  body('pincode').notEmpty().withMessage('Pincode is required').trim()
];

// Blood Stock validation
const bloodStockValidation = [
  body('bloodGroup').custom(value => {
    const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validGroups.includes(value.toUpperCase())) {
      throw new Error('Invalid blood group');
    }
    return true;
  }).withMessage('Valid blood group is required'),
  body('availableUnits').isInt({ min: 0 }).withMessage('Available units must be a non-negative integer')
];

router.route('/profile')
  .post(profileValidation, createHospitalProfile)
  .get(getHospitalProfile)
  .put(updateHospitalProfile);

router.post('/verify-request', submitVerificationRequest);

router.route('/blood-stock')
  .get(getBloodStock)
  .post(bloodStockValidation, addBloodStock);

router.route('/blood-stock/:bloodGroup')
  .put(updateBloodStock)
  .delete(removeBloodStock);

router.get('/requests', getCityRequests);
router.put('/requests/:id/approve', approveRequest);
router.put('/requests/:id/reject', rejectRequest);

router.get('/dashboard', getDashboardStats);

module.exports = router;

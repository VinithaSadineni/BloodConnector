const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/donor.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const router = express.Router();

router.use(protect);
router.use(requireRole('donor', 'admin')); // Donor and admin roles allowed

// Profile validation
const profileValidation = [
  body('bloodGroup').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Valid blood group is required'),
  body('age').isInt({ min: 18, max: 65 }).withMessage('Donor must be between 18 and 65 years old'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('weight').isFloat({ min: 45 }).withMessage('Donor must weight at least 45 kg')
];

router.route('/profile')
  .post(profileValidation, createDonorProfile)
  .get(getDonorProfile)
  .put(updateDonorProfile);

router.put('/availability', toggleAvailability);
router.get('/nearby-requests', getNearbyRequests);
router.get('/requests', getAssignedRequests);

router.put('/requests/:id/accept', acceptRequest);
router.post('/requests/:id/accept', acceptRequest);
router.put('/requests/:id/reject', rejectRequest);
router.post('/requests/:id/reject', rejectRequest);
router.put('/requests/:id/complete', completeDonation);

router.get('/history', getDonationHistory);
router.get('/dashboard', getDashboardStats);

module.exports = router;

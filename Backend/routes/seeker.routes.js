const express = require('express');
const { body } = require('express-validator');
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  cancelRequest,
  escalateToSOS,
  getDashboardStats,
  getProfile
} = require('../controllers/seeker.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { sosLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect);
router.use(requireRole('seeker', 'admin')); // seeker and admin roles can access
router.get('/profile', getProfile);

// Request Validation
const requestValidation = [
  body('patientName').notEmpty().withMessage('Patient name is required').trim(),
  body('bloodGroup').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Valid blood group is required'),
  body('unitsRequired').isNumeric().withMessage('Units required must be a number').custom(val => val > 0).withMessage('Units required must be greater than 0'),
  body('urgencyLevel').optional().isIn(['critical', 'urgent', 'moderate', 'normal']).withMessage('Invalid urgency level'),
  body('contactNumber').notEmpty().withMessage('Contact number is required').trim(),
  body('city').notEmpty().withMessage('City is required').trim(),
  body('state').notEmpty().withMessage('State is required').trim(),
  body('lat').optional().isNumeric().withMessage('Latitude must be a valid number'),
  body('lng').optional().isNumeric().withMessage('Longitude must be a valid number')
];

router.route('/requests')
  .post(requestValidation, createRequest)
  .get(getRequests);

router.get('/dashboard', getDashboardStats);

router.route('/requests/:id')
  .get(getRequestById)
  .put(updateRequest)
  .delete(cancelRequest);

router.post('/requests/:id/sos', sosLimiter, escalateToSOS);

module.exports = router;

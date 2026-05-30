const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  logout,
  getMe,
  changePassword
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');


const router = express.Router();

// Registration Validation
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6 or more characters'),
  body('role').isIn(['seeker', 'donor', 'hospital', 'admin']).withMessage('Role must be seeker, donor, hospital, or admin'),
  body('phone').optional().notEmpty().withMessage('Phone number cannot be empty').trim(),
  body('city').optional().trim(),
  body('state').optional().trim()
];

// Login Validation
const loginValidation = [
  body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

// Password Change Validation
const passwordValidation = [
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be 6 or more characters')
];


router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);
router.put('/change-password', protect, passwordValidation, changePassword);

module.exports = router;

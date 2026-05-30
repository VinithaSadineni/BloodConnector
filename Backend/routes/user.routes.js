const express = require('express');
const { getProfile, updateProfile, deleteAccount } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // All user routes require authentication

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

router.delete('/account', deleteAccount);

module.exports = router;

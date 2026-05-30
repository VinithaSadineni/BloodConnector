const express = require('express');
const {
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
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const router = express.Router();

router.use(protect);
router.use(requireRole('admin')); // Locked down to admins only

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);

// User Management
router.get('/users', getUsers);
router.route('/users/:id')
  .get(getUserById)
  .delete(banUser);

router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/unverify', revokeVerification);

// Request Management
router.get('/requests', getRequests);
router.put('/requests/:id/cancel', cancelSuspiciousRequest);

// Hospital Approvals
router.get('/hospitals/pending', getPendingHospitals);
router.put('/hospitals/:id/verify', verifyHospital);
router.put('/hospitals/:id/reject', rejectHospital);

module.exports = router;

const express = require('express');
const {
  searchDonors,
  searchHospitals,
  searchBloodStock,
  searchRequests
} = require('../controllers/search.controller');

const router = express.Router();

router.get('/donors', searchDonors);
router.get('/hospitals', searchHospitals);
router.get('/blood-stock', searchBloodStock);
router.get('/requests', searchRequests);

module.exports = router;

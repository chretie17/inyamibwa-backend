const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Endpoint to get report data with date filters
router.get('/', reportController.getReportData);

module.exports = router;

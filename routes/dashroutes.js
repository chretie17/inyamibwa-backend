// routes/adminRoutes.js
const express = require('express');
const adminDashboardController = require('../controllers/dashController');
const router = express.Router();

router.get('/dashboard', adminDashboardController.getAdminDashboardData);

module.exports = router;

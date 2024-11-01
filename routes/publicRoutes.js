const express = require('express');
const router = express.Router();
const userController = require('../controllers/publicuserController');

// Fetch user profile
router.get('/profile', userController.getProfile);

// Fetch trainings
router.get('/trainings', userController.getTrainings);

// Submit a complaint
router.post('/complaint', userController.submitComplaint);

module.exports = router;

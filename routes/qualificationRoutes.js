const express = require('express');
const router = express.Router();
const qualificationsController = require('../controllers/qualificationsController');

// Route to get all qualifications
router.get('/', qualificationsController.getAllQualifications);

// Route to add or update a qualification
router.post('/', qualificationsController.addOrUpdateQualification);

module.exports = router;

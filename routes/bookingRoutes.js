const express = require('express');
const bookingController = require('../controllers/bookingController');
const router = express.Router();

router.get('/', bookingController.getAllBookings);
router.post('/', bookingController.addBooking);

module.exports = router;

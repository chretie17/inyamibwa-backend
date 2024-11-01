const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Route to add or update event type (Admin)
router.post('/event-types', bookingController.addOrUpdateEventType);

// Route to get all event types (for dropdown in public booking)
router.get('/event-types', bookingController.getAllEventTypes);

// Route to book an event (Public)
router.post('/book', bookingController.bookEvent);

// Route to get all bookings (Admin)
router.get('/', bookingController.getAllBookings);
router.put('/approve/:id', bookingController.approveBooking);

router.put('/reject/:id', bookingController.rejectBooking);


module.exports = router;

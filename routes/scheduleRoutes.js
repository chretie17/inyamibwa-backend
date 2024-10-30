const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

router.post('/', scheduleController.createEvent);
router.get('/', scheduleController.getAllEvents);
router.get('/:id', scheduleController.getEventById);
router.put('/:id', scheduleController.updateEvent);
router.delete('/:id', scheduleController.deleteEvent);

module.exports = router;

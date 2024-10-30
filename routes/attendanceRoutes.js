const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/mark', attendanceController.markAttendance);
router.get('/all', attendanceController.getAllAttendanceWithUserNames);

module.exports = router;

const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.get('/', userController.getAllUsers);
router.post('/', userController.addUser);
router.put('/:id/qualifications', userController.updateQualifications);
router.get('/:id/attendance', userController.checkAttendance);
router.put('/:id', userController.updateUser);

module.exports = router;

// routes/complaintsRoutes.js

const express = require('express');
const complaintsController = require('../controllers/complaintController');
const router = express.Router();

router.post('/file', complaintsController.fileComplaint);

router.post('/submit', complaintsController.submitComplaint);

router.get('/', complaintsController.getAllComplaints);

router.put('/:id', complaintsController.updateComplaintStatus);

router.get('/user/:userId', complaintsController.getUserComplaints);
router.post('/reappeal/:id', complaintsController.reappealComplaint);


module.exports = router;

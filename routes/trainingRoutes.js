const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// CRUD routes
router.post('/', upload.single('file'), trainingController.createTraining);
router.get('/', trainingController.getTrainings);
router.get('/:id', trainingController.getTrainingById);
router.put('/:id', upload.single('file'), trainingController.updateTraining);
router.delete('/:id', trainingController.deleteTraining);

module.exports = router;

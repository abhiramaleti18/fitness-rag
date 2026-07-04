const express = require('express');
const router = express.Router();
const {
    createLog, getLogs, getLog, updateLog, deleteLog, getExerciseProgress
} = require('../controllers/workoutLogController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createLog);
router.get('/', protect, getLogs);
router.get('/progress/:exerciseName', protect, getExerciseProgress);
router.get('/:id', protect, getLog);
router.put('/:id', protect, updateLog);
router.delete('/:id', protect, deleteLog);

module.exports = router;
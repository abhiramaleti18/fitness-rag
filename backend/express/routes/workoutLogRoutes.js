const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createLog, getLogs, getLog, updateLog, deleteLog, getExerciseProgress, getConsistency, getLoggedExerciseNames, getSuggestion, getPersonalRecords, getWeeklySummary
} = require('../controllers/workoutLogController');

router.post('/', protect, createLog);
router.get('/', protect, getLogs);
router.get('/progress/:exerciseName', protect, getExerciseProgress);
router.get('/suggestion/:exerciseName', protect, getSuggestion);
router.get('/consistency', protect, getConsistency);
router.get('/exercise-names', protect, getLoggedExerciseNames);
router.get('/personal-records', protect, getPersonalRecords);
router.get('/weekly-summary', protect, getWeeklySummary);

module.exports = router;
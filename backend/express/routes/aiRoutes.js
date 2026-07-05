const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { search, recommend, getExercise, listExercises } = require('../controllers/aiController');

router.post('/search', protect, search);
router.post('/recommend', protect, recommend);
router.get('/exercise/:id', protect, getExercise);
router.get('/exercises', protect, listExercises);
router.post('/plan', protect, plan);

module.exports = router;
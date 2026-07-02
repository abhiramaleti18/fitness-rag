const express = require('express');
const router = express.Router();
const { search, recommend, getExercise } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/search', protect, search);
router.post('/recommend', protect, recommend);
router.get('/exercise/:id', protect, getExercise);

module.exports = router;
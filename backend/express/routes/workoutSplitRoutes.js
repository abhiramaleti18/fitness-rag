const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createSplit,
    getSplits,
    getSplit,
    renameSplit,
    deleteSplit
} = require('../controllers/workoutSplitController');

router.post('/', protect, createSplit);
router.get('/', protect, getSplits);
router.get('/:id', protect, getSplit);
router.put('/:id', protect, renameSplit);
router.delete('/:id', protect, deleteSplit);

module.exports = router;
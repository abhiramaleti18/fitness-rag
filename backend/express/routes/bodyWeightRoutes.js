const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createEntry, getHistory, deleteEntry } = require('../controllers/bodyWeightController');

router.post('/', protect, createEntry);
router.get('/', protect, getHistory);
router.delete('/:id', protect, deleteEntry);

module.exports = router;    
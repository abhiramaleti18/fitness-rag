const express = require('express');
const router = express.Router();
const { updateProfile, addPersonalRecord, deletePersonalRecord } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

router.put('/', protect, updateProfile);
router.post('/records', protect, addPersonalRecord);
router.delete('/records/:recordId', protect, deletePersonalRecord);

module.exports = router;
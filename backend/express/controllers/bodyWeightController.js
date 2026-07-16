const BodyWeightLog = require('../models/BodyWeightLog');

exports.createEntry = async (req, res) => {
    try {
        const { weight, date } = req.body;

        if (!weight || weight <= 0) {
            return res.status(400).json({ message: 'A valid weight is required' });
        }

        const entry = await BodyWeightLog.create({
            userId: req.user.id,
            weight,
            date: date || Date.now()
        });

        res.status(201).json({ success: true, entry });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const entries = await BodyWeightLog.find({ userId: req.user.id }).sort({ date: 1 });
        res.status(200).json({ success: true, entries });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteEntry = async (req, res) => {
    try {
        const entry = await BodyWeightLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!entry) return res.status(404).json({ message: 'Entry not found' });
        res.status(200).json({ success: true, message: 'Entry deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
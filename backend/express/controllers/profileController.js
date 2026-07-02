const User = require('../models/User');

exports.updateProfile = async (req, res) => {
    try {
        const { weight, height, fitnessGoals, equipmentAccess, experienceLevel } = req.body;

        const updates = {};
        if (weight !== undefined) updates.weight = weight;
        if (height !== undefined) updates.height = height;
        if (fitnessGoals !== undefined) updates.fitnessGoals = fitnessGoals;
        if (equipmentAccess !== undefined) updates.equipmentAccess = equipmentAccess;
        if (experienceLevel !== undefined) updates.experienceLevel = experienceLevel;

        const user = await User.findByIdAndUpdate(req.user.id, updates, {
            new: true,
            runValidators: true
        }).select('-password');

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addPersonalRecord = async (req, res) => {
    try {
        const { exerciseName, weight, reps } = req.body;

        if (!exerciseName || !weight) {
            return res.status(400).json({ message: 'Exercise name and weight are required' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $push: { personalRecords: { exerciseName, weight, reps: reps || 1 } } },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(201).json({ success: true, personalRecords: user.personalRecords });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deletePersonalRecord = async (req, res) => {
    try {
        const { recordId } = req.params;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { personalRecords: { _id: recordId } } },
            { new: true }
        ).select('-password');

        res.status(200).json({ success: true, personalRecords: user.personalRecords });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
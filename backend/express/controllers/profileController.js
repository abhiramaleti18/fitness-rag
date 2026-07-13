const User = require('../models/User');

exports.updateProfile = async (req, res) => {
    try {
        const { weight, height, fitnessGoals, equipmentAccess, experienceLevel, injuries } = req.body;

        const updates = {};
        if (weight !== undefined) updates.weight = weight;
        if (height !== undefined) updates.height = height;
        if (fitnessGoals !== undefined) updates.fitnessGoals = fitnessGoals;
        if (equipmentAccess !== undefined) updates.equipmentAccess = equipmentAccess;
        if (experienceLevel !== undefined) updates.experienceLevel = experienceLevel;
        if (injuries !== undefined) updates.injuries = injuries;

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

        const newReps = reps || 1;
        const user = await User.findById(req.user.id);

        const existingIndex = user.personalRecords.findIndex(
            pr => pr.exerciseName.toLowerCase() === exerciseName.toLowerCase()
        );

        if (existingIndex !== -1) {
            const existing = user.personalRecords[existingIndex];
            const isBetter = weight > existing.weight || (weight === existing.weight && newReps > existing.reps);

            if (!isBetter) {
                return res.status(200).json({
                    success: true,
                    message: 'Existing record is equal or better — not updated',
                    personalRecords: user.personalRecords
                });
            }

            user.personalRecords[existingIndex].weight = weight;
            user.personalRecords[existingIndex].reps = newReps;
            user.personalRecords[existingIndex].date = new Date();
        } else {
            user.personalRecords.push({ exerciseName, weight, reps: newReps });
        }

        await user.save();

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
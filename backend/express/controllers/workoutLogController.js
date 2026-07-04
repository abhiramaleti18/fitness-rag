const WorkoutLog = require('../models/WorkoutLog');

exports.createLog = async (req, res) => {
    try {
        const { date, dayLabel, exercises } = req.body;

        if (!exercises || exercises.length === 0) {
            return res.status(400).json({ message: 'At least one exercise is required' });
        }

        const log = await WorkoutLog.create({
            userId: req.user.id,
            date: date || new Date(),
            dayLabel,
            exercises
        });

        res.status(201).json({ success: true, log });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const { limit = 30 } = req.query;

        const logs = await WorkoutLog.find({ userId: req.user.id })
            .sort({ date: -1 })
            .limit(Number(limit));

        res.status(200).json({ success: true, count: logs.length, logs });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getLog = async (req, res) => {
    try {
        const log = await WorkoutLog.findOne({ _id: req.params.id, userId: req.user.id });
        if (!log) return res.status(404).json({ message: 'Log not found' });
        res.status(200).json({ success: true, log });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateLog = async (req, res) => {
    try {
        const { dayLabel, exercises } = req.body;

        const log = await WorkoutLog.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { dayLabel, exercises },
            { new: true, runValidators: true }
        );

        if (!log) return res.status(404).json({ message: 'Log not found' });
        res.status(200).json({ success: true, log });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteLog = async (req, res) => {
    try {
        const log = await WorkoutLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!log) return res.status(404).json({ message: 'Log not found' });
        res.status(200).json({ success: true, message: 'Log deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Progress tracking for a specific exercise across all logged sessions
exports.getExerciseProgress = async (req, res) => {
    try {
        const { exerciseName } = req.params;

        const logs = await WorkoutLog.find({
            userId: req.user.id,
            'exercises.exerciseName': { $regex: `^${exerciseName}$`, $options: 'i' }
        }).sort({ date: 1 });

        const progress = logs.map(log => {
            const match = log.exercises.find(
                e => e.exerciseName.toLowerCase() === exerciseName.toLowerCase()
            );
            const maxSet = match.sets.reduce((best, s) =>
                (s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps)) ? s : best,
                match.sets[0]
            );
            return { date: log.date, topSet: maxSet };
        });

        res.status(200).json({ success: true, exerciseName, progress });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
const axios = require('axios');
const WorkoutSplit = require('../models/WorkoutSplit');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

exports.createSplit = async (req, res) => {
    try {
        const { name, sourceQuery, days, isCustom } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'A name is required' });
        }

        if (!days || days.length === 0) {
            return res.status(400).json({ message: 'At least one day is required' });
        }

        let aiReport;

        // Only custom (user-built) splits get analyzed — AI-generated splits
        // already went through deterministic tier/role logic, so analysis
        // would be redundant.
        if (isCustom) {
            try {
                const analysisPayload = {
                    days: days.map(d => ({
                        dayNumber: d.dayNumber,
                        focus: d.focus,
                        exercises: d.exercises.map(ex => ({ exerciseName: ex.exerciseName }))
                    }))
                };

                const response = await axios.post(`${FASTAPI_URL}/api/analyze-split`, analysisPayload);

                aiReport = {
                    text: response.data.report,
                    muscleCoverage: response.data.muscleCoverage,
                    movementPatternBalance: response.data.movementPatternBalance,
                    generatedAt: new Date()
                };
            } catch (analysisError) {
                // Don't block saving the split just because analysis failed —
                // the user's custom split is still valid without a report.
                console.error('Split analysis failed:', analysisError.message);
            }
        }

        const split = await WorkoutSplit.create({
            userId: req.user.id,
            name: name.trim(),
            sourceQuery,
            isCustom: !!isCustom,
            days,
            aiReport
        });

        res.status(201).json({ success: true, split });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getSplits = async (req, res) => {
    try {
        const splits = await WorkoutSplit.find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: splits.length, splits });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getSplit = async (req, res) => {
    try {
        const split = await WorkoutSplit.findOne({ _id: req.params.id, userId: req.user.id });
        if (!split) return res.status(404).json({ message: 'Split not found' });
        res.status(200).json({ success: true, split });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.renameSplit = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'A name is required' });
        }

        const split = await WorkoutSplit.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { name: name.trim() },
            { new: true, runValidators: true }
        );

        if (!split) return res.status(404).json({ message: 'Split not found' });
        res.status(200).json({ success: true, split });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteSplit = async (req, res) => {
    try {
        const split = await WorkoutSplit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!split) return res.status(404).json({ message: 'Split not found' });
        res.status(200).json({ success: true, message: 'Split deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
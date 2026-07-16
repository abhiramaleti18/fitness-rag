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
function toDayKey(date) {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

exports.getWeeklySummary = async (req, res) => {
    try {
        const now = new Date();
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay(); // 0 = Sunday
        const diffToMonday = (day === 0 ? -6 : 1 - day);
        startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const weekLogs = await WorkoutLog.find({
            userId: req.user.id,
            date: { $gte: startOfWeek }
        });

        const workoutsThisWeek = weekLogs.length;

        let totalVolume = 0;
        for (const log of weekLogs) {
            for (const ex of log.exercises) {
                for (const set of ex.sets) {
                    totalVolume += (set.weight || 0) * (set.reps || 0);
                }
            }
        }

        const oneYearAgo = new Date();
        oneYearAgo.setDate(oneYearAgo.getDate() - 365);
        const allLogs = await WorkoutLog.find({
            userId: req.user.id,
            date: { $gte: oneYearAgo }
        }).select('date');

        const loggedDays = new Set(allLogs.map(l => toDayKey(l.date)));

        let streak = 0;
        const cursor = new Date();
        cursor.setHours(0, 0, 0, 0);

        if (!loggedDays.has(toDayKey(cursor))) {
            cursor.setDate(cursor.getDate() - 1);
        }

        while (loggedDays.has(toDayKey(cursor))) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
        }

        res.status(200).json({
            success: true,
            workoutsThisWeek,
            totalVolume: Math.round(totalVolume),
            streak
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getPersonalRecords = async (req, res) => {
    try {
        const names = await WorkoutLog.distinct('exercises.exerciseName', { userId: req.user.id });
        const records = [];

        for (const name of names) {
            const logs = await WorkoutLog.find({
                userId: req.user.id,
                'exercises.exerciseName': name
            });

            let best = null;

            for (const log of logs) {
                const entry = log.exercises.find(e => e.exerciseName === name);
                if (!entry) continue;

                for (const set of entry.sets) {
                    const oneRepMax = set.weight * (1 + set.reps / 30);
                    if (!best || oneRepMax > best.oneRepMax) {
                        best = {
                            weight: set.weight,
                            reps: set.reps,
                            date: log.date,
                            oneRepMax: Math.round(oneRepMax)
                        };
                    }
                }
            }

            if (best) {
                records.push({ exerciseName: name, ...best });
            }
        }

        records.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
        res.status(200).json({ success: true, records });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getLoggedExerciseNames = async (req, res) => {
    try {
        const names = await WorkoutLog.distinct('exercises.exerciseName', { userId: req.user.id });
        res.status(200).json({ success: true, names: names.sort() });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Deterministic progressive overload suggestion — compares your last two
// logged sessions for an exercise and suggests a next-session target.
// No LLM involved: numeric coaching advice should be computed, not guessed.
exports.getSuggestion = async (req, res) => {
    try {
        const { exerciseName } = req.params;

        const logs = await WorkoutLog.find({
            userId: req.user.id,
            'exercises.exerciseName': { $regex: `^${exerciseName}$`, $options: 'i' }
        }).sort({ date: -1 }).limit(2);

        if (logs.length === 0) {
            return res.status(200).json({
                success: true,
                exerciseName,
                suggestion: null,
                message: 'No logged history for this exercise yet.'
            });
        }

        const getTopSet = (log) => {
            const match = log.exercises.find(
                e => e.exerciseName.toLowerCase() === exerciseName.toLowerCase()
            );
            return match.sets.reduce((best, s) =>
                (s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps)) ? s : best,
                match.sets[0]
            );
        };

        // logs are sorted newest-first
        const latest = { date: logs[0].date, topSet: getTopSet(logs[0]) };
        const previous = logs.length > 1 ? { date: logs[1].date, topSet: getTopSet(logs[1]) } : null;

        const isBodyweight = latest.topSet.weight === 0;
        const increment = isBodyweight ? 0 : (latest.topSet.weight >= 40 ? 5 : 2.5);

        let suggestedWeight = latest.topSet.weight;
        let suggestedReps = latest.topSet.reps;
        let rationale;

        if (!previous) {
            suggestedReps = latest.topSet.reps + 1;
            rationale = `This is your only logged session for ${exerciseName}. Aim to match ${latest.topSet.weight}kg but push for ${suggestedReps} reps on your top set to start building a trend.`;
        } else {
            const improved = latest.topSet.weight > previous.topSet.weight ||
                (latest.topSet.weight === previous.topSet.weight && latest.topSet.reps > previous.topSet.reps);
            const regressed = latest.topSet.weight < previous.topSet.weight ||
                (latest.topSet.weight === previous.topSet.weight && latest.topSet.reps < previous.topSet.reps);

            if (improved && !isBodyweight) {
                suggestedWeight = latest.topSet.weight + increment;
                suggestedReps = Math.max(latest.topSet.reps - 2, 5);
                rationale = `You improved from ${previous.topSet.weight}kg x ${previous.topSet.reps} to ${latest.topSet.weight}kg x ${latest.topSet.reps} last time. Try adding weight: ${suggestedWeight}kg for around ${suggestedReps} reps.`;
            } else if (improved && isBodyweight) {
                suggestedReps = latest.topSet.reps + 1;
                rationale = `You went from ${previous.topSet.reps} to ${latest.topSet.reps} reps last time. Aim for ${suggestedReps} reps this session.`;
            } else if (regressed) {
                suggestedWeight = previous.topSet.weight;
                suggestedReps = previous.topSet.reps;
                rationale = `Your last session (${latest.topSet.weight}kg x ${latest.topSet.reps}) was a step down from the one before (${previous.topSet.weight}kg x ${previous.topSet.reps}). Aim to match ${suggestedWeight}kg x ${suggestedReps} reps and prioritize good form and recovery.`;
            } else {
                suggestedReps = latest.topSet.reps + 1;
                rationale = `You've matched ${latest.topSet.weight}kg x ${latest.topSet.reps} across recent sessions. Try pushing for ${suggestedReps} reps at the same weight before increasing load.`;
            }
        }

        res.status(200).json({
            success: true,
            exerciseName,
            lastSession: { date: latest.date, weight: latest.topSet.weight, reps: latest.topSet.reps },
            suggestion: { weight: suggestedWeight, reps: suggestedReps },
            rationale
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getConsistency = async (req, res) => {
    try {
        const oneYearAgo = new Date();
        oneYearAgo.setDate(oneYearAgo.getDate() - 365);

        const logs = await WorkoutLog.find({
            userId: req.user.id,
            date: { $gte: oneYearAgo }
        }).select('date');

        const counts = {};
        logs.forEach(log => {
            const key = toDayKey(log.date);
            counts[key] = (counts[key] || 0) + 1;
        });

        res.status(200).json({ success: true, counts });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
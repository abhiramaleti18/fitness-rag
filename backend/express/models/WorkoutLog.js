const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
    setNumber: { type: Number, required: true },
    reps: { type: Number, required: true },
    weight: { type: Number, default: 0 } // kg, 0 for bodyweight
}, { _id: false });

const loggedExerciseSchema = new mongoose.Schema({
    exerciseName: { type: String, required: true },
    sets: [setSchema],
    notes: { type: String, trim: true }
});

const workoutLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    dayLabel: {
        type: String, // e.g. "Push Day", "Monday Chest"
        trim: true
    },
    exercises: [loggedExerciseSchema]
}, { timestamps: true });

// One log per user per calendar day keeps things simple to query/edit
workoutLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
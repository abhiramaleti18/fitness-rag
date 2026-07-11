const mongoose = require('mongoose');

const exerciseTemplateSchema = new mongoose.Schema({
    exerciseName: { type: String, required: true, trim: true },
    focus: { type: String, trim: true },           // e.g. "Push (Chest, Shoulders, Triceps)" — inherited from the day
    prescription: {
        sets: { type: String, default: '' },
        reps: { type: String, default: '' },
        rest: { type: String, default: '' }
    },
    howItWorks: { type: String, trim: true },
    movementPattern: { type: String, trim: true }
}, { _id: false });

const warmupTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    targetMuscle: { type: String, trim: true },
    holdTime: { type: String, trim: true }
}, { _id: false });

const dayTemplateSchema = new mongoose.Schema({
    dayNumber: { type: Number, required: true },
    focus: { type: String, trim: true },
    warmup: [warmupTemplateSchema],
    exercises: [exerciseTemplateSchema]
}, { _id: false });

const workoutSplitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    sourceQuery: {
        type: String,
        trim: true
    },
    isCustom: {
        type: Boolean,
        default: false
    },
    days: {
        type: [dayTemplateSchema],
        required: true,
        validate: {
            validator: (v) => Array.isArray(v) && v.length > 0,
            message: 'A workout split must have at least one day'
        }
    },
    aiReport: {
        text: { type: String },
        muscleCoverage: { type: mongoose.Schema.Types.Mixed },
        movementPatternBalance: { type: mongoose.Schema.Types.Mixed },
        generatedAt: { type: Date }
    }
}, { timestamps: true });

workoutSplitSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('WorkoutSplit', workoutSplitSchema);
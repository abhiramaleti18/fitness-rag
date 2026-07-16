const mongoose = require('mongoose');

const bodyWeightLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

bodyWeightLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('BodyWeightLog', bodyWeightLogSchema);
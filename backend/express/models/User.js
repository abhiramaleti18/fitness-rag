const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    fitnessGoals: [{
        type: String
    }],
    experienceLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    equipmentAccess: [{
        type: String
    }],
    weight: {
        type: Number, // kg
        default: null
    },
    height: {
        type: Number, // cm
        default: null
    },
    personalRecords: [{
        exerciseName: { type: String, required: true },
        weight: { type: Number, required: true }, // kg
        reps: { type: Number, default: 1 },
        date: { type: Date, default: Date.now }
    }],
    injuries: [{
    type: String
    }]
}, { timestamps: true });

userSchema.methods.comparePassword = async function(candidatePassword) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model('User', userSchema);
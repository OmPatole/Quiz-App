const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    prn: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Student'],
        default: 'Student'
    },
    academicYear: {
        type: String,
        enum: ['First Year', 'Second Year', 'Third Year', 'Last Year', 'Graduated'],
        // Not required for Admin
    },
    branch: {
        type: String,
        enum: ['CST', 'E&TC', 'Mechanical', 'Food', 'Chemical'],
        // Not required for Admin
    },
    batchYear: {
        type: String
        // e.g. "2026-2027"
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastQuizDate: {
        type: Date
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // Allows null/undefined values for students who might not have emails
        lowercase: true,
        trim: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update streak when a quiz is submitted
userSchema.methods.updateStreak = async function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lastDate = this.lastQuizDate ? new Date(this.lastQuizDate) : null;
    if (lastDate) lastDate.setHours(0, 0, 0, 0);

    let streakUpdated = false;

    if (!lastDate) {
        // First ever quiz
        this.currentStreak = 1;
        this.longestStreak = 1;
        this.lastQuizDate = new Date();
        streakUpdated = true;
    } else {
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day
            this.currentStreak += 1;
            if (this.currentStreak > this.longestStreak) {
                this.longestStreak = this.currentStreak;
            }
            this.lastQuizDate = new Date();
            streakUpdated = true;
        } else if (diffDays > 1) {
            // Missed a day (or more)
            this.currentStreak = 1;
            this.lastQuizDate = new Date();
            streakUpdated = true;
        }
        // diffDays === 0 means same day, do nothing to streak count
    }

    if (streakUpdated) {
        await this.save();
    }
    return streakUpdated;
};

// Method to check and reset streak if a day was missed (usually called on login)
userSchema.methods.resetStreakIfBroken = async function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDate = this.lastQuizDate ? new Date(this.lastQuizDate) : null;
    if (lastDate) lastDate.setHours(0, 0, 0, 0);

    if (lastDate) {
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
            this.currentStreak = 0;
            await this.save();
            return true;
        }
    }
    return false;
};

module.exports = mongoose.model('User', userSchema);

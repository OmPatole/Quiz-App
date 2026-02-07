const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    timeLeft: {
        type: Number, // in seconds
        required: true
    },
    answers: {
        // Map of questionIndex: selectedIndices (array)
        type: Map,
        of: [Number],
        default: {}
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure unique session per student per quiz
quizSessionSchema.index({ studentId: 1, quizId: 1 }, { unique: true });

module.exports = mongoose.model('QuizSession', quizSessionSchema);

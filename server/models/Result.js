const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionIndex: {
        type: Number,
        required: true
    },
    selectedIndices: [{
        type: Number
    }]
}, { _id: false });

const resultSchema = new mongoose.Schema({
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
    score: {
        type: Number,
        required: true,
        default: 0
    },
    totalMarks: {
        type: Number,
        required: true
    },
    answers: [answerSchema],
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries (not unique, allows multiple attempts)
resultSchema.index({ studentId: 1, quizId: 1 });

module.exports = mongoose.model('Result', resultSchema);

const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: ''
    },
    quizType: {
        type: String,
        enum: ['practice', 'weekly'],
        default: 'practice'
    },
    duration: {
        type: Number,
        required: true,
        default: 30 // in minutes
    },
    scheduledAt: {
        type: Date,
        default: null
    },
    showAnswersAtEnd: {
        type: Boolean,
        default: true
    },
    requireFullscreenForWeekly: {
        type: Boolean,
        default: true
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);

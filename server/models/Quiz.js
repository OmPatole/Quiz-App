const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: null
    }
}, { _id: false });

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    marks: {
        type: Number,
        required: true,
        default: 1
    },
    options: [optionSchema],
    correctIndices: [{
        type: Number,
        required: true
    }],
    explanation: {
        type: String,
        default: ''
    },
    isMultiSelect: {
        type: Boolean,
        default: false
    }
}, { _id: false });

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
    questions: [questionSchema],
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);

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
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
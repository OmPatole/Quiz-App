const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    quizzes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Chapter', chapterSchema);

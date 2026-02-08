const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    folderName: {
        type: String,
        required: true,
        trim: true
    },
    fileUrl: {
        type: String,
        required: function () { return this.type === 'pdf'; }
    },
    type: {
        type: String,
        enum: ['pdf', 'link'],
        default: 'pdf'
    },
    linkUrl: {
        type: String,
        required: function () { return this.type === 'link'; }
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Material', materialSchema);

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Chapter = require('../models/Chapter');

// @route   GET /api/chapters
// @desc    Get all chapters (for students)
// @access  Student only
router.get('/', auth, roleAuth('Student'), async (req, res) => {
    try {
        const chapters = await Chapter.find().populate('quizzes', 'title duration category quizType');
        res.json(chapters);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/chapters/:id
// @desc    Get chapter with quizzes
// @access  Student only
router.get('/:id', auth, roleAuth('Student'), async (req, res) => {
    try {
        const chapter = await Chapter.findById(req.params.id).populate({
            path: 'quizzes',
            select: 'title description quizType duration category'
        });

        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }

        res.json(chapter);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

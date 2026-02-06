const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

// @route   GET /api/quiz/:id
// @desc    Get quiz for taking (without correct answers)
// @access  Student only
router.get('/:id', auth, roleAuth('Student'), async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).select('-questions.correctIndices -questions.explanation');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        res.json(quiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/quiz/submit
// @desc    Submit quiz and calculate score
// @access  Student only
router.post('/submit', auth, roleAuth('Student'), async (req, res) => {
    try {
        const { quizId, answers } = req.body;

        if (!quizId || !answers) {
            return res.status(400).json({ message: 'Quiz ID and answers are required' });
        }

        // Get quiz with correct answers
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Calculate score
        let score = 0;
        let totalMarks = 0;
        const detailedResults = [];

        quiz.questions.forEach((question, index) => {
            totalMarks += question.marks;

            const studentAnswer = answers.find(a => a.questionIndex === index);
            const selectedIndices = studentAnswer ? studentAnswer.selectedIndices : [];

            // Check if answer is correct
            const correctIndices = question.correctIndices.sort();
            const isCorrect =
                selectedIndices.length === correctIndices.length &&
                selectedIndices.sort().every((val, idx) => val === correctIndices[idx]);

            if (isCorrect) {
                score += question.marks;
            }

            detailedResults.push({
                questionIndex: index,
                questionText: question.text,
                selectedIndices,
                correctIndices: question.correctIndices,
                isCorrect,
                marks: isCorrect ? question.marks : 0,
                explanation: question.explanation
            });
        });

        // Save result
        const result = new Result({
            studentId: req.user._id,
            quizId,
            score,
            totalMarks,
            answers
        });

        await result.save();

        res.json({
            message: 'Quiz submitted successfully',
            score,
            totalMarks,
            percentage: ((score / totalMarks) * 100).toFixed(2),
            detailedResults
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/quiz/results/:quizId
// @desc    Get student's result for a specific quiz
// @access  Student only
router.get('/results/:quizId', auth, roleAuth('Student'), async (req, res) => {
    try {
        const result = await Result.findOne({
            studentId: req.user._id,
            quizId: req.params.quizId
        }).populate('quizId', 'title description');

        if (!result) {
            return res.status(404).json({ message: 'No result found for this quiz' });
        }

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/quiz/my-results
// @desc    Get all results for the logged-in student
// @access  Student only
router.get('/my-results', auth, roleAuth('Student'), async (req, res) => {
    try {
        const results = await Result.find({ studentId: req.user._id })
            .populate('quizId', 'title description quizType')
            .sort({ submittedAt: -1 });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

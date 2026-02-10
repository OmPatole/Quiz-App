const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

// @route   GET /api/quiz/:id (Moved to bottom)

// @route   POST /api/quiz/submit
// @desc    Submit quiz, calculate score, and update streak
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

            // Include full question details and explanation for review
            detailedResults.push({
                questionIndex: index,
                questionText: question.text,
                options: question.options,
                selectedIndices,
                correctIndices: question.correctIndices,
                isCorrect,
                marks: isCorrect ? question.marks : 0,
                explanation: question.explanation
            });
        });

        // Save result - Always update if exists, create if new
        // Ensure quizId is properly converted to ObjectId
        const quizObjectId = mongoose.Types.ObjectId.isValid(quizId) 
            ? new mongoose.Types.ObjectId(quizId) 
            : quizId;

        let result = await Result.findOne({ 
            studentId: req.user._id, 
            quizId: quizObjectId 
        });

        if (result) {
            // Update existing result with latest attempt
            result.score = score;
            result.totalMarks = totalMarks;
            result.answers = answers;
            result.submittedAt = new Date();
            await result.save();
            console.log(`Updated existing result for student ${req.user._id}, quiz ${quizObjectId}`);
        } else {
            // Create new result for first attempt
            result = new Result({
                studentId: req.user._id,
                quizId: quizObjectId,
                score,
                totalMarks,
                answers
            });
            await result.save();
            console.log(`Created new result for student ${req.user._id}, quiz ${quizObjectId}`);
        }

        // --- Streak Logic ---
        const User = require('../models/User');
        const student = await User.findById(req.user._id);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to midnight

        let lastDate = student.lastQuizDate ? new Date(student.lastQuizDate) : null;
        if (lastDate) lastDate.setHours(0, 0, 0, 0);

        let streakUpdated = false;

        if (!lastDate) {
            // First ever quiz
            student.currentStreak = 1;
            student.longestStreak = 1;
            student.lastQuizDate = new Date();
            streakUpdated = true;
        } else {
            const diffTime = Math.abs(today - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consecutive day
                student.currentStreak += 1;
                if (student.currentStreak > student.longestStreak) {
                    student.longestStreak = student.currentStreak;
                }
                student.lastQuizDate = new Date();
                streakUpdated = true;
            } else if (diffDays > 1) {
                // Missed a day (or more)
                student.currentStreak = 1;
                student.lastQuizDate = new Date();
                streakUpdated = true;
            }
            // diffDays === 0 means same day, do nothing
        }

        if (streakUpdated) {
            await student.save();
        }

        res.json({
            message: 'Quiz submitted successfully',
            score,
            totalMarks,
            percentage: ((score / totalMarks) * 100).toFixed(2),
            detailedResults,
            streak: {
                current: student.currentStreak,
                longest: student.longestStreak,
                updated: streakUpdated
            }
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

// @route   POST /api/quiz/save-progress
// @desc    Save current quiz progress (timeLeft, answers)
// @access  Student only
const QuizSession = require('../models/QuizSession');

router.post('/save-progress', auth, roleAuth('Student'), async (req, res) => {
    try {
        const { quizId, timeLeft, answers } = req.body;

        if (!quizId) {
            return res.status(400).json({ message: 'Quiz ID is required' });
        }

        // Convert answers array structure to Map for storage if needed,
        // or just store the same structure. The prompt asked for Map: { questionIndex: selectedOptionIndex }
        // BUT our frontend state `answers` is likely array of objects: [{questionIndex: 0, selectedIndices: [1]}]
        // Let's store a Map where Key = questionIndex (string), Value = selectedIndices (array)

        const answersMap = {};
        if (answers && Array.isArray(answers)) {
            answers.forEach(ans => {
                answersMap[ans.questionIndex] = ans.selectedIndices;
            });
        }

        await QuizSession.findOneAndUpdate(
            { studentId: req.user._id, quizId },
            {
                timeLeft,
                answers: answersMap,
                lastUpdated: Date.now()
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ message: 'Progress saved' });
    } catch (error) {
        console.error("Save Progress Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/quiz/progress/:quizId
// @desc    Get saved progress for a quiz
// @access  Student only
router.get('/progress/:quizId', auth, roleAuth('Student'), async (req, res) => {
    try {
        const session = await QuizSession.findOne({
            studentId: req.user._id,
            quizId: req.params.quizId
        });

        if (!session) {
            return res.json({ found: false });
        }

        res.json({
            found: true,
            timeLeft: session.timeLeft,
            answers: session.answers // This will come back as object/map 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/quiz/progress/:quizId
// @desc    Clear saved progress
// @access  Student only
router.delete('/progress/:quizId', auth, roleAuth('Student'), async (req, res) => {
    try {
        await QuizSession.findOneAndDelete({
            studentId: req.user._id,
            quizId: req.params.quizId
        });
        res.json({ message: 'Progress cleared' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
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

module.exports = router;

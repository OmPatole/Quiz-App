const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const User = require('../models/User');
const QuizSession = require('../models/QuizSession');
const sanitize = require('mongo-sanitize');

// @route   GET /api/quiz/:id (Moved to bottom)

// @route   POST /api/quiz/submit
// @desc    Submit quiz, calculate score, and update streak
// @access  Student only
router.post('/submit', auth, roleAuth('Student'), async (req, res) => {
    try {
        const { quizId, answers, timeTaken } = req.body;

        if (!quizId || !answers) {
            return res.status(400).json({ message: 'Quiz ID and answers are required' });
        }

        const sanitizedQuizId = sanitize(quizId);

        // Get quiz with correct answers
const quiz = await Quiz.findById(sanitizedQuizId).populate('questions');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const quizObjectId = mongoose.Types.ObjectId.isValid(quizId)
            ? new mongoose.Types.ObjectId(quizId)
            : quizId;

        const deadline = quiz.quizType === 'weekly' && quiz.scheduledAt
            ? new Date(new Date(quiz.scheduledAt).getTime() + (quiz.duration || 0) * 60000)
            : null;
        const isWeeklyClosed = deadline ? Date.now() > deadline.getTime() : false;

        if (quiz.quizType === 'weekly') {
            if (isWeeklyClosed) {
                return res.status(403).json({ message: 'This weekly quiz is closed' });
            }

            const existingWeeklyResult = await Result.findOne({
                studentId: req.user._id,
                quizId: quizObjectId
            });

            if (existingWeeklyResult) {
                return res.status(409).json({ message: 'You have already submitted this weekly quiz' });
            }
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

        let result = await Result.findOne({
            studentId: req.user._id,
            quizId: quizObjectId
        });

        if (quiz.quizType === 'weekly') {
            // Weekly quizzes are hard-limited to a single attempt.
            if (result) {
                return res.status(409).json({ message: 'Weekly quiz allows only one attempt' });
            }

            result = new Result({
                studentId: req.user._id,
                quizId: quizObjectId,
                score,
                totalMarks,
                answers,
                timeTaken: timeTaken ?? null
            });
            await result.save();
            console.log(`Created weekly result for student ${req.user._id}, quiz ${quizObjectId}`);
        } else {
            // Practice quizzes keep latest attempt by updating existing result.
            if (result) {
                result.score = score;
                result.totalMarks = totalMarks;
                result.answers = answers;
                if (timeTaken != null) result.timeTaken = timeTaken;
                result.submittedAt = new Date();
                await result.save();
                console.log(`Updated existing practice result for student ${req.user._id}, quiz ${quizObjectId}`);
            } else {
                result = new Result({
                    studentId: req.user._id,
                    quizId: quizObjectId,
                    score,
                    totalMarks,
                    answers,
                    timeTaken: timeTaken ?? null
                });
                await result.save();
                console.log(`Created new practice result for student ${req.user._id}, quiz ${quizObjectId}`);
            }
        }

        // --- Streak Logic ---
        const student = await User.findById(req.user._id);
        const streakUpdated = await student.updateStreak();

        res.json({
            message: 'Quiz submitted successfully',
            quizId: quiz._id,
            quizType: quiz.quizType,
            showAnswersAtEnd: quiz.quizType === 'practice' ? true : quiz.showAnswersAtEnd,
            score,
            totalMarks,
            percentage: ((score / totalMarks) * 100).toFixed(2),
            detailedResults: quiz.quizType === 'practice' || quiz.showAnswersAtEnd ? detailedResults : [],
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
        const sanitizedQuizId = sanitize(req.params.quizId);
        const result = await Result.findOne({
            studentId: req.user._id,
            quizId: sanitizedQuizId
        }).populate('quizId', 'title description quizType showAnswersAtEnd');

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

        const sanitizedQuizId = sanitize(quizId);

        await QuizSession.findOneAndUpdate(
            { studentId: req.user._id, quizId: sanitizedQuizId },
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
        const sanitizedQuizId = sanitize(req.params.quizId);
        const session = await QuizSession.findOne({
            studentId: req.user._id,
            quizId: sanitizedQuizId
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
        const sanitizedQuizId = sanitize(req.params.quizId);
        await QuizSession.findOneAndDelete({
            studentId: req.user._id,
            quizId: sanitizedQuizId
        });
        res.json({ message: 'Progress cleared' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// @route   GET /api/quiz/leaderboard/:quizId
// @desc    Get leaderboard for a specific weekly quiz
// @access  Student and Admin
router.get('/leaderboard/:quizId', auth, async (req, res) => {
    try {
        // Allow both Student and Admin roles
        if (req.user.role !== 'Student' && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const sanitizedQuizId = sanitize(req.params.quizId);

        // Verify the quiz exists and is of type 'weekly'
        const quiz = await Quiz.findById(sanitizedQuizId).select('title quizType totalMarks');
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        if (quiz.quizType !== 'weekly') {
            return res.status(400).json({ message: 'Leaderboard is only available for weekly quizzes' });
        }

        // Aggregate leaderboard: one entry per student, ranked by score desc, then submission time asc
        const leaderboard = await Result.aggregate([
            { $match: { quizId: new mongoose.Types.ObjectId(sanitizedQuizId) } },
            {
                $group: {
                    _id: '$studentId',
                    score: { $max: '$score' },       // Best score if multiple attempts
                    totalMarks: { $first: '$totalMarks' },
                    submittedAt: { $min: '$submittedAt' }, // Earliest submission for tiebreak
                    timeTaken: { $min: '$timeTaken' }      // Best (fastest) time taken
                }
            },
            { $sort: { score: -1, submittedAt: 1 } },  // High score first, earliest time wins ties
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
            {
                $project: {
                    _id: 0,
                    studentId: '$_id',
                    name: '$student.name',
                    prn: '$student.prn',
                    score: 1,
                    totalMarks: 1,
                    percentage: {
                        $round: [
                            {
                                $multiply: [
                                    { $divide: ['$score', '$totalMarks'] },
                                    100
                                ]
                            },
                            1
                        ]
                    },
                    submittedAt: 1,
                    timeTaken: 1
                }
            }
        ]);

        // Add rank numbers
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            rank: index + 1,
            ...entry
        }));

        // Find the logged-in student's position (if Student role)
        let myRank = null;
        if (req.user.role === 'Student') {
            const myEntry = rankedLeaderboard.find(e => e.studentId.toString() === req.user._id.toString());
            myRank = myEntry ? myEntry.rank : null;
        }

        res.json({
            quizTitle: quiz.title,
            totalParticipants: rankedLeaderboard.length,
            leaderboard: rankedLeaderboard,
            myRank
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/quiz/:id
// @desc    Get quiz for taking (without correct answers)
// @access  Student only
router.get('/:id', auth, roleAuth('Student'), async (req, res) => {
    try {
        const sanitizedId = sanitize(req.params.id);
        const quiz = await Quiz.findById(sanitizedId).populate({
            path: 'questions',
            select: '-correctIndices -explanation'
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        if (quiz.quizType === 'weekly') {
            const deadline = quiz.scheduledAt
                ? new Date(new Date(quiz.scheduledAt).getTime() + (quiz.duration || 0) * 60000)
                : null;
            const isClosed = deadline ? Date.now() > deadline.getTime() : false;
            const existingResult = await Result.findOne({
                studentId: req.user._id,
                quizId: quiz._id
            }).select('_id');

            if (existingResult || isClosed) {
                return res.status(403).json({ message: 'This weekly quiz is no longer available' });
            }
        }

        res.json(quiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

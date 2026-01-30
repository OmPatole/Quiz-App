const express = require('express');
const router = express.Router();
const { Quiz, Result, Student } = require('../models');
const { authenticateToken, identifyUser } = require('../middleware/auth');

// --- ADMIN ROUTES ---

// Get all quizzes for admin (No category filtering)
router.get('/admin/my-quizzes', authenticateToken, async (req, res) => {
    try {
        const quizzes = await Quiz.find().sort({ updatedAt: -1 });
        res.json(quizzes);
    } catch (e) { res.status(500).json({ error: "Fetch Failed" }); }
});

// Get single quiz details for editor
router.get('/admin/quiz-details/:id', authenticateToken, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ id: req.params.id });
        if (!quiz) return res.status(404).json({ error: "Not found" });
        res.json(quiz);
    } catch (e) { res.status(500).json({ error: "Fetch Failed" }); }
});

// Create or Update Quiz
router.post('/quizzes', authenticateToken, async (req, res) => {
    try {
        const updateData = { ...req.body };
        delete updateData._id; // Prevent immutable field error
        
        const { id } = updateData;
        // Upsert: Update if exists, Create if not
        await Quiz.findOneAndUpdate({ id }, updateData, { upsert: true, new: true });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Save Failed: " + e.message }); }
});

// Delete Quiz
router.delete('/quizzes/:id', authenticateToken, async (req, res) => {
    try {
        await Quiz.deleteOne({ id: req.params.id });
        await Result.deleteMany({ quizId: req.params.id });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Delete Failed" }); }
});

// --- STUDENT ROUTES ---

// 1. GET ALL QUIZZES (Unified View)
router.get('/quizzes', identifyUser, async (req, res) => {
    try {
        // Fetch all quizzes, hiding correct answers for security
        const quizzes = await Quiz.find({}, '-questions.correctIndices');
        res.json(quizzes);
    } catch (e) { res.status(500).json({ error: "DB Error" }); }
});

// 2. GET SINGLE QUIZ
router.get('/quizzes/:id', identifyUser, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ id: req.params.id });
        if (!quiz) return res.status(404).json({ error: "Not found" });

        // If it's a mock test, send everything (including explanations if needed)
        // If it's a live test, sanitize the questions to remove correct answers/explanations
        let questionsToSend = quiz.quizType === 'mock' 
            ? quiz.questions 
            : quiz.questions.map(q => { 
                const { correctIndices, explanation, ...safe } = q.toObject(); 
                return safe; 
            });

        res.json({ ...quiz.toObject(), questions: questionsToSend });
    } catch (e) { res.status(500).json({ error: "Error" }); }
});

// 3. STUDENT PROFILE & STATS (NEW ROUTE)
router.get('/student-profile', authenticateToken, async (req, res) => {
    try {
        const { prn } = req.user;
        // Fetch all results for this student
        const results = await Result.find({ prn }).sort({ submittedAt: -1 });
        
        // 1. Calculate Basic Stats
        const totalTests = results.length;
        const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
        // Assuming 100 marks per test for calculation if totalMarks is missing
        const maxTotalMarks = results.reduce((acc, curr) => acc + (curr.totalMarks || 100), 0); 
        
        const avgScore = totalTests ? Math.round((totalScore / totalTests)) : 0;
        const accuracy = maxTotalMarks ? Math.round((totalScore / maxTotalMarks) * 100) : 0;
        
        // 2. Generate Activity Heatmap Data
        const activityMap = {}; 
        results.forEach(r => {
            const date = r.submittedAt.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            activityMap[date] = (activityMap[date] || 0) + 1;
        });

        // 3. Find Best Performance
        const bestResult = results.length > 0 ? results.reduce((prev, current) => (prev.score > current.score) ? prev : current) : null;

        res.json({
            stats: { 
                totalTests, 
                avgScore, 
                accuracy, 
                bestScore: bestResult ? bestResult.score : 0 
            },
            activityMap,
            recentActivity: results.slice(0, 10) // Send last 10 activities
        });
    } catch (e) { 
        console.error(e);
        res.status(500).json({ error: "Failed to fetch profile" }); 
    }
});

// Check if student has already attempted a specific quiz
router.post('/check-attempt', async (req, res) => {
    try {
        const { quizId, prn } = req.body;
        const quiz = await Quiz.findOne({ id: quizId });
        
        // Mock tests allow unlimited attempts
        if (quiz && quiz.quizType === 'mock') return res.json({ attempted: false });
        
        const exists = await Result.exists({ quizId, prn });
        res.json({ attempted: !!exists });
    } catch (e) { res.status(500).json({ error: "Check Failed" }); }
});

// Submit Quiz Score
router.post('/submit-score', async (req, res) => {
    try {
        const { quizId, prn, studentName, year, userAnswers, status } = req.body;
        const quiz = await Quiz.findOne({ id: quizId });
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });

        // Prevent duplicate submissions for non-mock tests
        if (quiz.quizType !== 'mock') {
            const exists = await Result.findOne({ quizId, prn });
            if (exists) return res.json({ success: false, message: "Already submitted" });
        }

        let calculatedScore = 0;
        let totalQuestions = 0;
        
        quiz.questions.forEach((q, idx) => {
            if (q.type === 'mcq') {
                totalQuestions += parseInt(q.marks || 0);
                const userSel = userAnswers[idx]?.selectedIndices || [];
                const correct = q.correctIndices.slice().sort().join(',');
                const studentSel = userSel.slice().sort().join(',');
                
                if (correct === studentSel) {
                    calculatedScore += parseInt(q.marks || 0);
                }
            }
        });

        const student = await Student.findOne({ prn });
        const branch = student ? student.branch : 'External';
        
        await Result.create({ 
            quizId, prn, studentName, year, branch, 
            score: calculatedScore, 
            totalMarks: totalQuestions || 100, 
            status 
        });
        res.json({ success: true, score: calculatedScore });
    } catch (e) { res.status(500).json({ error: "Submit Failed" }); }
});

// Public Leaderboard
router.get('/leaderboard/:quizId', async (req, res) => {
    try {
        const results = await Result.find({ quizId: req.params.quizId }).sort({ score: -1, submittedAt: 1 });
        res.json(results);
    } catch (e) { res.status(500).json({ error: "Fetch Failed" }); }
});

module.exports = router;
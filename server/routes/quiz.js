const express = require('express');
const router = express.Router();
const { Quiz, Result, Student } = require('../models');
const { authenticateToken, identifyUser } = require('../middleware/auth');

// --- ADMIN ROUTES ---
router.get('/admin/my-quizzes', authenticateToken, async (req, res) => {
    try {
        let filter = {};
        const userScope = req.user.scope || (req.user.role === 'superadmin' ? 'all' : 'aptitude');
        if (userScope !== 'all') filter.category = userScope;
        const quizzes = await Quiz.find(filter).sort({ updatedAt: -1 });
        res.json(quizzes);
    } catch (e) { res.status(500).json({ error: "Fetch Failed" }); }
});

router.get('/admin/quiz-details/:id', authenticateToken, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ id: req.params.id });
        if (!quiz) return res.status(404).json({ error: "Not found" });
        const userScope = req.user.scope || (req.user.role === 'superadmin' ? 'all' : 'aptitude');
        if(userScope !== 'all' && quiz.category !== userScope) return res.status(403).json({ error: "Access Denied" });
        res.json(quiz);
    } catch (e) { res.status(500).json({ error: "Fetch Failed" }); }
});

router.post('/quizzes', authenticateToken, async (req, res) => {
    try {
        const updateData = { ...req.body };
        delete updateData._id; 
        let userScope = req.user.scope || (req.user.role === 'superadmin' ? 'all' : 'aptitude');

        if (!updateData.category) updateData.category = userScope !== 'all' ? userScope : 'aptitude';
        
        if (userScope !== 'all' && updateData.category !== userScope) {
            return res.status(403).json({ error: `Permission Denied` });
        }

        const { id } = updateData;
        await Quiz.findOneAndUpdate({ id }, updateData, { upsert: true, new: true });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Save Failed: " + e.message }); }
});

router.delete('/quizzes/:id', authenticateToken, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ id: req.params.id });
        if (!quiz) return res.json({ success: true });
        const userScope = req.user.scope || (req.user.role === 'superadmin' ? 'all' : 'aptitude');
        if(userScope !== 'all' && quiz.category !== userScope) return res.status(403).json({ error: "Access Denied" });

        await Quiz.deleteOne({ id: req.params.id });
        await Result.deleteMany({ quizId: req.params.id });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Delete Failed" }); }
});

// --- STUDENT ROUTES (UPDATED FOR DUAL COURSE) ---

// 1. GET ALL QUIZZES
router.get('/quizzes', identifyUser, async (req, res) => {
    try {
        let filter = {};

        if (req.user && req.user.role === 'student') {
            const cat = req.user.category;
            // IF 'both', we apply NO filter (they see everything)
            // IF specific, we lock them to that category
            if (cat !== 'both') {
                filter.category = cat;
            }
        }
        
        const quizzes = await Quiz.find(filter, '-questions.correctIndices');
        res.json(quizzes);
    } catch (e) { res.status(500).json({ error: "DB Error" }); }
});

// 2. GET SINGLE QUIZ
router.get('/quizzes/:id', identifyUser, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ id: req.params.id });
        if (!quiz) return res.status(404).json({ error: "Not found" });

        if (req.user && req.user.role === 'student') {
            const cat = req.user.category;
            // Allow access if user is 'both' OR user category matches quiz category
            if (cat !== 'both' && quiz.category && quiz.category !== cat) {
                 return res.status(403).json({ error: "Access Denied" });
            }
        }

        let questionsToSend = quiz.quizType === 'mock' ? quiz.questions : quiz.questions.map(q => { const { correctIndices, explanation, ...safe } = q.toObject(); return safe; });
        res.json({ ...quiz.toObject(), questions: questionsToSend });
    } catch (e) { res.status(500).json({ error: "Error" }); }
});

router.post('/check-attempt', async (req, res) => {
    try {
        const { quizId, prn } = req.body;
        const quiz = await Quiz.findOne({ id: quizId });
        if (quiz && quiz.quizType === 'mock') return res.json({ attempted: false });
        const exists = await Result.exists({ quizId, prn });
        res.json({ attempted: !!exists });
    } catch (e) { res.status(500).json({ error: "Check Failed" }); }
});

router.post('/submit-score', async (req, res) => {
    try {
        const { quizId, prn, studentName, year, userAnswers, status } = req.body;
        const quiz = await Quiz.findOne({ id: quizId });
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });

        if (quiz.quizType !== 'mock') {
            const exists = await Result.findOne({ quizId, prn });
            if (exists) return res.json({ success: false, message: "Already submitted" });
        }

        let calculatedScore = 0;
        quiz.questions.forEach((q, idx) => {
            if (q.type === 'mcq') {
                const userSel = userAnswers[idx]?.selectedIndices || [];
                const correct = q.correctIndices.slice().sort().join(',');
                const studentSel = userSel.slice().sort().join(',');
                if (correct === studentSel) calculatedScore += parseInt(q.marks || 0);
            } else if (q.type === 'code' && userAnswers[idx]?.passed) {
                calculatedScore += parseInt(q.marks || 0);
            }
        });

        const student = await Student.findOne({ prn });
        const branch = student ? student.branch : 'External';
        await Result.create({ quizId, prn, studentName, year, branch, score: calculatedScore, totalMarks: 100, status });
        res.json({ success: true, score: calculatedScore });
    } catch (e) { res.status(500).json({ error: "Submit Failed" }); }
});

router.get('/leaderboard/:quizId', async (req, res) => {
    const results = await Result.find({ quizId: req.params.quizId }).sort({ score: -1, submittedAt: 1 });
    res.json(results);
});

module.exports = router;
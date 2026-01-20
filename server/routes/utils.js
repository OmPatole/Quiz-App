const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { Material, Result, Quiz } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

router.post('/generate-quiz', authenticateToken, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No PDF' });
    try {
        const data = await pdfParse(fs.readFileSync(req.file.path));
        const lines = data.text.split('\n').map(l => l.trim()).filter(l => l);
        const questions = [];
        let currentQ = null;
        lines.forEach(line => {
          if (/^(\d+[\.)]|Q\d+)\s/.test(line)) {
            if (currentQ) questions.push(currentQ);
            currentQ = { id: Date.now() + Math.random(), type: 'mcq', text: line.replace(/^(\d+[\.)]|Q\d+)\s/, ''), marks: 5, options: [], correctIndices: [0], isMultiSelect: false };
          } else if (currentQ && /^[a-dA-D][\.\)]\s/.test(line)) {
            currentQ.options.push({ text: line.replace(/^[a-dA-D][\.\)]\s/, ''), image: '' });
          } else if (currentQ && currentQ.options.length === 0) currentQ.text += " " + line;
        });
        if (currentQ) questions.push(currentQ);
        fs.unlinkSync(req.file.path);
        res.json({ success: true, questions });
    } catch (e) { res.status(500).json({ error: "Error" }); }
});

router.post('/run-code', async (req, res) => {
    try {
        const { language, sourceCode, input } = req.body;
        const response = await axios.post('https://emkc.org/api/v2/piston/execute', { 
            language, version: '*', files: [{ content: sourceCode }], stdin: input || "" 
        });
        res.json(response.data);
    } catch(e) { res.status(500).json({error: "Run failed"}); }
});

router.get('/materials', async (req, res) => {
    const mats = await Material.find().sort({ createdAt: -1 });
    res.json(mats);
});
router.post('/materials', authenticateToken, async (req, res) => {
    await Material.create({ id: Date.now().toString(), ...req.body, createdBy: req.user.username });
    res.json({ success: true });
});
router.delete('/materials/:id', authenticateToken, async (req, res) => {
    await Material.deleteOne({ id: req.params.id });
    res.json({ success: true });
});

// Student Stats Route (Moved here for convenience)
router.get('/admin/student-stats/:prn', authenticateToken, async (req, res) => {
    const { prn } = req.params;
    const results = await Result.find({ prn }).sort({ submittedAt: -1 });
    const quizIds = results.map(r => r.quizId);
    const quizzes = await Quiz.find({ id: { $in: quizIds } });
    const quizMap = {}; quizzes.forEach(q => quizMap[q.id] = q.quizType);
    let weeklyCount = 0, mockCount = 0, totalScore = 0;
    const detailedResults = results.map(r => {
        const type = quizMap[r.quizId] || 'unknown';
        if(type === 'mock') mockCount++; else { weeklyCount++; totalScore += (r.score || 0); }
        return { ...r.toObject(), quizTitle: quizzes.find(q => q.id === r.quizId)?.title || 'Unknown', quizType: type };
    });
    res.json({ stats: { totalSolved: results.length, weeklyCount, mockCount, avgScore: weeklyCount > 0 ? (totalScore / weeklyCount).toFixed(1) : 0 }, history: detailedResults });
});

module.exports = router;
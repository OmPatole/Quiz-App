require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const hpp = require('hpp');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pdfParse = require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'beta_secret_key_123';

// --- DIRECTORIES ---
const DATA_DIR = path.join(__dirname, 'results');
const QUIZ_DIR = path.join(__dirname, 'quizzes');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DB_DIR = path.join(__dirname, 'data');

[DATA_DIR, QUIZ_DIR, UPLOAD_DIR, DB_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// --- HELPERS ---
const getFile = (file) => path.join(DB_DIR, file);
const readJSON = (file, defaultVal = []) => {
  try {
    const fPath = getFile(file);
    if (!fs.existsSync(fPath)) fs.writeFileSync(fPath, JSON.stringify(defaultVal, null, 2));
    return JSON.parse(fs.readFileSync(fPath, 'utf8'));
  } catch (e) { return defaultVal; }
};
const writeJSON = (file, data) => fs.writeFileSync(getFile(file), JSON.stringify(data, null, 2));

// --- INIT ADMIN ---
(async () => {
  const admins = readJSON('admins.json');
  if (admins.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(process.env.ADMIN_PASS || 'admin123', salt);
    admins.push({ id: 'superadmin', username: process.env.ADMIN_USER || 'admin', password: hash, role: 'superadmin' });
    writeJSON('admins.json', admins);
  }
})();

// --- MIDDLEWARE ---
app.use(express.json({ limit: '50mb' })); 
app.use(hpp()); 
// Allow all origins for local development (IP access)
app.use(cors({ origin: '*' })); 
app.use('/uploads', express.static(UPLOAD_DIR));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  })
});

// --- AUTH ROUTES ---
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const admins = readJSON('admins.json');
  const user = admins.find(a => a.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ success: false });
  const token = jwt.sign({ id: user.id, username: user.username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ success: true, token, username: user.username });
});

app.post('/api/student/login', (req, res) => {
  const { name, prn, year } = req.body;
  if (!name || !prn || !year) return res.status(400).json({ error: "Missing fields" });
  
  const students = readJSON('students.json');
  let student = students.find(s => s.prn === prn);
  
  if (!student) {
    student = { id: Date.now().toString(), name, prn, year, joinedAt: new Date() };
    students.push(student);
    writeJSON('students.json', students);
  } else {
    student.name = name;
    student.year = year;
    writeJSON('students.json', students);
  }

  const token = jwt.sign({ id: student.id, prn: student.prn, role: 'student' }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ success: true, token, student });
});

// --- SECURE QUIZ ACCESS (STUDENT VIEW) ---
app.get('/api/quizzes/:id', (req, res) => {
  const p = path.join(QUIZ_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(p)) return res.status(404).json({ error: "Not found" });
  
  try {
    const fullQuiz = JSON.parse(fs.readFileSync(p, 'utf8'));
    
    // SECURITY: Remove answers before sending to client
    const sanitizedQuestions = fullQuiz.questions.map(q => {
        const { correctIndices, ...safeQuestion } = q; 
        return safeQuestion;
    });

    const safeQuiz = { ...fullQuiz, questions: sanitizedQuestions };
    res.json(safeQuiz);
  } catch (e) { res.status(500).json({ error: "Server Error" }); }
});

// --- FULL QUIZ ACCESS (ADMIN VIEW) ---
app.get('/api/admin/quiz-details/:id', authenticateToken, (req, res) => {
    const p = path.join(QUIZ_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(p)) return res.status(404).json({ error: "Not found" });
    res.json(JSON.parse(fs.readFileSync(p, 'utf8')));
});

// --- SECURE SCORING ---
app.post('/api/submit-score', (req, res) => {
    const { quizId, prn, studentName, year, userAnswers, status } = req.body;
    
    const quizPath = path.join(QUIZ_DIR, `${quizId}.json`);
    const resultPath = path.join(DATA_DIR, `${quizId}.json`);

    if (!fs.existsSync(quizPath)) return res.status(404).json({ error: "Quiz not found" });

    try {
        const quizData = JSON.parse(fs.readFileSync(quizPath, 'utf8'));
        
        // 1. Server-Side Year Validation
        if (quizData.targetYears?.length > 0 && !quizData.targetYears.includes(year)) {
             return res.status(403).json({ error: "Year mismatch" });
        }

        // 2. Server-Side Scoring
        let calculatedScore = 0;
        let totalMarks = 0;

        quizData.questions.forEach((q, idx) => {
            totalMarks += parseInt(q.marks || 0);
            if (q.type === 'mcq') {
                const studentSelection = userAnswers[idx]?.selectedIndices || [];
                const correct = q.correctIndices.slice().sort().join(',');
                const student = studentSelection.slice().sort().join(',');
                if (correct === student) calculatedScore += parseInt(q.marks);
            } else if (q.type === 'code') {
                // Trusting passed flag for simplicity in file-based version, 
                // but secure architecture would re-run logic here.
                if (userAnswers[idx]?.passed) calculatedScore += parseInt(q.marks);
            }
        });

        // 3. Save Result
        let results = fs.existsSync(resultPath) ? JSON.parse(fs.readFileSync(resultPath, 'utf8')) : [];
        
        // Block duplicates ONLY for Weekly tests
        if(quizData.quizType !== 'mock' && results.some(d => d.prn === prn)) {
            return res.json({ success: false, message: "Already attempted" });
        }

        const newEntry = {
            prn, studentName, year,
            score: calculatedScore,
            totalMarks,
            status,
            submittedAt: new Date()
        };

        results.push(newEntry);
        fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
        res.json({ success: true, score: calculatedScore, total: totalMarks });

    } catch (error) { res.status(500).json({ error: "Submission failed" }); }
});

// --- QUIZ MANAGEMENT ---
app.get('/api/quizzes', (req, res) => {
  try {
    const files = fs.readdirSync(QUIZ_DIR);
    const quizzes = files.map(file => {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(QUIZ_DIR, file), 'utf8'));
        return {
          id: content.id, title: content.title, schedule: content.schedule,
          questionCount: content.questions?.length || 0,
          createdBy: content.createdBy || 'Admin', targetYears: content.targetYears || [],
          category: content.category || 'aptitude', quizType: content.quizType || 'weekly', duration: content.duration || 60
        };
      } catch (e) { return null; }
    }).filter(q => q);
    res.json(quizzes);
  } catch (e) { res.json([]); }
});

app.get('/api/admin/my-quizzes', authenticateToken, (req, res) => {
  try {
    const files = fs.readdirSync(QUIZ_DIR);
    const quizzes = files.map(file => {
      try {
        const c = JSON.parse(fs.readFileSync(path.join(QUIZ_DIR, file), 'utf8'));
        if (c.createdBy && c.createdBy !== req.user.username) return null;
        return c;
      } catch (e) { return null; }
    }).filter(q => q);
    res.json(quizzes);
  } catch (e) { res.json([]); }
});

app.post('/api/quizzes', authenticateToken, (req, res) => {
  const { id, title, schedule, questions, createdBy, targetYears, category, quizType, duration } = req.body;
  const p = path.join(QUIZ_DIR, `${id}.json`);
  const quizData = { 
      id, title, schedule, questions, 
      createdBy: req.user.username, targetYears: targetYears || [],
      category: category || 'aptitude', quizType: quizType || 'weekly', duration: duration || 60,
      updatedAt: new Date() 
  };
  fs.writeFileSync(p, JSON.stringify(quizData, null, 2));
  res.json({ success: true });
});

app.delete('/api/quizzes/:id', authenticateToken, (req, res) => {
  const p = path.join(QUIZ_DIR, `${req.params.id}.json`);
  if (fs.existsSync(p)) fs.unlinkSync(p);
  res.json({ success: true });
});

// --- MISC (Materials, PDF, Upload, Check Attempt) ---
app.get('/api/materials', (req, res) => res.json(readJSON('materials.json')));
app.post('/api/materials', authenticateToken, (req, res) => {
  const { title, type, parentId, fileUrl } = req.body;
  const materials = readJSON('materials.json');
  materials.push({ id: Date.now().toString(), title, type, parentId: parentId || null, fileUrl, createdBy: req.user.username, createdAt: new Date() });
  writeJSON('materials.json', materials);
  res.json({ success: true });
});
app.delete('/api/materials/:id', authenticateToken, (req, res) => {
  let materials = readJSON('materials.json');
  materials = materials.filter(m => m.id !== req.params.id && m.parentId !== req.params.id);
  writeJSON('materials.json', materials);
  res.json({ success: true });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

app.post('/api/generate-quiz', authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No PDF' });
  try {
    const data = await pdfParse(fs.readFileSync(req.file.path));
    const text = data.text;
    const questions = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
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
    res.json({ success: true, questions });
  } catch (e) { res.status(500).json({ error: "Parse Error" }); }
});

app.post('/api/check-attempt', (req, res) => {
    const { quizId, prn } = req.body;
    const qPath = path.join(QUIZ_DIR, `${quizId}.json`);
    if (fs.existsSync(qPath)) {
        const quiz = JSON.parse(fs.readFileSync(qPath, 'utf8'));
        if (quiz.quizType === 'mock') return res.json({ attempted: false });
    }
    const p = path.join(DATA_DIR, `${quizId}.json`);
    if (!fs.existsSync(p)) return res.json({ attempted: false });
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    res.json({ attempted: data.some(d => d.prn === prn) });
});

app.get('/api/leaderboard/:quizId', (req, res) => {
    const p = path.join(DATA_DIR, `${req.params.quizId}.json`);
    if (!fs.existsSync(p)) return res.json([]);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    data.sort((a, b) => b.score - a.score || new Date(a.submittedAt) - new Date(b.submittedAt));
    res.json(data);
});

app.post('/api/run-code', async (req, res) => {
    try {
        const { language, sourceCode, input } = req.body;
        const response = await axios.post('https://emkc.org/api/v2/piston/execute', { language, version: '*', files: [{ content: sourceCode }], stdin: input || "" });
        res.json(response.data);
    } catch(e) { res.status(500).json({error: "Run failed"}); }
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
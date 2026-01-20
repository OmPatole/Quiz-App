require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const multer = require('multer');
const hpp = require('hpp');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pdfParse = require('pdf-parse');
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser'); // Bulk Upload
const { Admin, Student, Quiz, Result, Material } = require('./models'); // Ensure models.js exists

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'beta_secret_key_123';

// --- DATABASE CONNECTION ---
// Update credentials if your local setup is different
const MONGO_URI = process.env.MONGO_URI || 'mongodb://quizAppUser:SecureAppPassword2026!@localhost:27017/quiz_app_db?authSource=quiz_app_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- INIT DEFAULT ADMIN ---
const initAdmin = async () => {
  try {
    const count = await Admin.countDocuments();
    if (count === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(process.env.ADMIN_PASS || 'admin123', salt);
      await Admin.create({ 
        username: process.env.ADMIN_USER || 'admin', 
        password: hash, 
        role: 'superadmin' 
      });
      console.log('👑 Default Admin Created');
    }
  } catch (e) { console.error("Admin Init Error:", e); }
};
initAdmin();

// --- MIDDLEWARE ---
app.use(express.json({ limit: '50mb' })); 
app.use(hpp()); 
app.use(cors({ origin: '*' })); // Allow all IPs for local network testing
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});
const upload = multer({ storage });

// --- AUTH MIDDLEWARE ---
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

// =======================
//      AUTH ROUTES
// =======================

// 1. Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Admin.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, username: user.username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, username: user.username });
  } catch (e) { res.status(500).json({ error: "Server Error" }); }
});

// 2. Student Login (Strict DB Verification)
app.post('/api/student/login', async (req, res) => {
  try {
    const { name, prn } = req.body;
    if (!name || !prn) return res.status(400).json({ error: "Missing credentials" });
    
    // Find exact PRN match
    const student = await Student.findOne({ prn });
    if (!student) return res.status(404).json({ error: "Student not found in database." });

    // Case-insensitive Name Check
    if (student.name.toLowerCase().trim() !== name.toLowerCase().trim()) {
      return res.status(401).json({ error: "Name does not match PRN record." });
    }

    const token = jwt.sign({ 
        id: student._id, 
        prn: student.prn, 
        year: student.year, 
        branch: student.branch,
        role: 'student' 
    }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ success: true, token, student });
  } catch (e) { res.status(500).json({ error: "Login Error" }); }
});

// =======================
//    ADMIN MANAGEMENT
// =======================

// Bulk Student Upload (CSV)
app.post('/api/admin/upload-students', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No CSV uploaded' });

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
        // Clean keys
        const cleanData = {};
        Object.keys(data).forEach(k => cleanData[k.trim().toLowerCase()] = data[k].trim());
        
        if(cleanData.name && cleanData.prn && cleanData.year && cleanData.branch) {
            results.push({
                name: cleanData.name,
                prn: cleanData.prn,
                year: cleanData.year,
                branch: cleanData.branch
            });
        }
    })
    .on('end', async () => {
      try {
        const operations = results.map(s => ({
            updateOne: {
                filter: { prn: s.prn },
                update: { $set: s },
                upsert: true
            }
        }));
        if(operations.length > 0) await Student.bulkWrite(operations);
        
        // Cleanup file
        fs.unlinkSync(req.file.path);
        res.json({ success: true, message: `Processed ${results.length} students` });
      } catch (e) { 
          res.status(500).json({ error: "Database Import Failed" }); 
          if(fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      }
    });
});

// Admin Get Full Quiz (For Editing)
app.get('/api/admin/quiz-details/:id', authenticateToken, async (req, res) => {
    const quiz = await Quiz.findOne({ id: req.params.id });
    if (!quiz) return res.status(404).json({ error: "Not found" });
    res.json(quiz);
});

// Admin Get All Quizzes
app.get('/api/admin/my-quizzes', authenticateToken, async (req, res) => {
  const quizzes = await Quiz.find().sort({ updatedAt: -1 });
  res.json(quizzes);
});

// Create/Update Quiz
app.post('/api/quizzes', authenticateToken, async (req, res) => {
  const { id, title, schedule, questions, createdBy, targetYears, category, quizType, duration } = req.body;
  
  await Quiz.findOneAndUpdate(
    { id }, 
    { id, title, schedule, questions, createdBy, targetYears, category, quizType, duration }, 
    { upsert: true, new: true }
  );
  res.json({ success: true });
});

// Delete Quiz & Results
app.delete('/api/quizzes/:id', authenticateToken, async (req, res) => {
  await Quiz.deleteOne({ id: req.params.id });
  await Result.deleteMany({ quizId: req.params.id });
  res.json({ success: true });
});

// =======================
//     STUDENT QUIZ
// =======================

// Get All Quizzes (Sanitized List)
app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find({}, '-questions.correctIndices -questions.testCases.output'); 
    res.json(quizzes);
  } catch (e) { res.status(500).json({ error: "DB Error" }); }
});

// Get Single Quiz (SECURITY: Removes Answers)
app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ id: req.params.id });
    if (!quiz) return res.status(404).json({ error: "Not found" });

    // Secure Data Stripping
    const sanitizedQuestions = quiz.questions.map(q => {
        const { correctIndices, ...safe } = q.toObject(); // Convert mongoose doc to object first
        return safe;
    });

    res.json({ ...quiz.toObject(), questions: sanitizedQuestions });
  } catch (e) { res.status(500).json({ error: "Server Error" }); }
});

// Check Previous Attempt
app.post('/api/check-attempt', async (req, res) => {
    const { quizId, prn } = req.body;
    const quiz = await Quiz.findOne({ id: quizId });
    
    // Mock tests allow unlimited attempts
    if (quiz && quiz.quizType === 'mock') return res.json({ attempted: false });

    const exists = await Result.exists({ quizId, prn });
    res.json({ attempted: !!exists });
});

// Submit Score (SECURITY: Server-Side Calculation)
app.post('/api/submit-score', async (req, res) => {
    const { quizId, prn, studentName, year, userAnswers, status } = req.body;
    
    const quiz = await Quiz.findOne({ id: quizId });
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    // 1. Get Student Branch
    const student = await Student.findOne({ prn });
    const branch = student ? student.branch : 'External';

    // 2. Prevent Cheating (Duplicate Submission for Weekly)
    if (quiz.quizType !== 'mock') {
        const exists = await Result.findOne({ quizId, prn });
        if (exists) return res.json({ success: false, message: "Already submitted" });
    }

    // 3. Calculate Score on Server
    let calculatedScore = 0;
    let totalMarks = 0;

    quiz.questions.forEach((q, idx) => {
        totalMarks += parseInt(q.marks || 0);
        
        if (q.type === 'mcq') {
            const userSel = userAnswers[idx]?.selectedIndices || [];
            // Sort to ensure [0,1] matches [1,0]
            const correct = q.correctIndices.slice().sort().join(',');
            const studentSel = userSel.slice().sort().join(',');
            
            if (correct === studentSel) calculatedScore += parseInt(q.marks);
        } 
        else if (q.type === 'code') {
            // For production security, you would re-run the code here.
            // For now, we trust the Piston runner result passed from client 
            // OR you can implement a backend verification step here.
            if (userAnswers[idx]?.passed) calculatedScore += parseInt(q.marks);
        }
    });

    await Result.create({
        quizId, prn, studentName, year, branch,
        score: calculatedScore,
        totalMarks, status
    });

    res.json({ success: true, score: calculatedScore });
});

// Leaderboard
app.get('/api/leaderboard/:quizId', async (req, res) => {
    const results = await Result.find({ quizId: req.params.quizId })
        .sort({ score: -1, submittedAt: 1 });
    res.json(results);
});

// =======================
//        UTILS
// =======================

// Upload Image/PDF
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// PDF Parsing for Quiz Generation
app.post('/api/generate-quiz', authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No PDF' });
  try {
    const data = await pdfParse(fs.readFileSync(req.file.path));
    const text = data.text;
    
    // Parser Logic
    const questions = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    let currentQ = null;
    
    lines.forEach(line => {
      if (/^(\d+[\.)]|Q\d+)\s/.test(line)) {
        if (currentQ) questions.push(currentQ);
        currentQ = { 
            id: Date.now() + Math.random(), 
            type: 'mcq', 
            text: line.replace(/^(\d+[\.)]|Q\d+)\s/, ''), 
            marks: 5, 
            options: [], 
            correctIndices: [0], 
            isMultiSelect: false 
        };
      } else if (currentQ && /^[a-dA-D][\.\)]\s/.test(line)) {
        currentQ.options.push({ text: line.replace(/^[a-dA-D][\.\)]\s/, ''), image: '' });
      } else if (currentQ && currentQ.options.length === 0) {
        currentQ.text += " " + line;
      }
    });
    if (currentQ) questions.push(currentQ);
    
    // Clean up
    fs.unlinkSync(req.file.path);
    res.json({ success: true, questions });
  } catch (e) { 
      if(fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: "PDF Parse Error" }); 
  }
});

// Code Runner Proxy (Piston)
app.post('/api/run-code', async (req, res) => {
    try {
        const { language, sourceCode, input } = req.body;
        const response = await axios.post('https://emkc.org/api/v2/piston/execute', { 
            language, version: '*', files: [{ content: sourceCode }], stdin: input || "" 
        });
        res.json(response.data);
    } catch(e) { res.status(500).json({error: "Run failed"}); }
});

// Study Materials (DB)
app.get('/api/materials', async (req, res) => {
    const mats = await Material.find().sort({ createdAt: -1 });
    res.json(mats);
});

app.post('/api/materials', authenticateToken, async (req, res) => {
    const { title, type, parentId, fileUrl } = req.body;
    await Material.create({
        id: Date.now().toString(),
        title, type, parentId, fileUrl, 
        createdBy: req.user.username
    });
    res.json({ success: true });
});

app.delete('/api/materials/:id', authenticateToken, async (req, res) => {
    await Material.deleteOne({ id: req.params.id });
    res.json({ success: true });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Production Server running on port ${PORT}`));
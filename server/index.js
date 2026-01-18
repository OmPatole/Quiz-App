require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const multer = require('multer');

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- 2. DIRECTORY SETUP ---
const DATA_DIR = path.join(__dirname, 'results');
const QUIZ_DIR = path.join(__dirname, 'quizzes');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure all directories exist
[DATA_DIR, QUIZ_DIR, UPLOAD_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve Uploaded Images Statically
app.use('/uploads', express.static(UPLOAD_DIR));

// --- 3. MULTER CONFIG (IMAGE UPLOADS) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp + original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- 4. API ENDPOINTS ---

// A. SECURE ADMIN LOGIN
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (
    username === process.env.ADMIN_USER && 
    password === process.env.ADMIN_PASS
  ) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid Credentials" });
  }
});

// B. Upload Image
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ imageUrl: `http://localhost:3001/uploads/${req.file.filename}` });
});

// C. List All Quizzes
app.get('/api/quizzes', (req, res) => {
  try {
    const files = fs.readdirSync(QUIZ_DIR);
    const quizzes = files.map(file => {
      try {
        const filePath = path.join(QUIZ_DIR, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return {
          id: content.id || file.replace('.json', ''),
          title: content.title || 'Untitled Quiz',
          schedule: content.schedule,
          questionCount: content.questions ? content.questions.length : 0
        };
      } catch (err) { return null; }
    }).filter(q => q !== null);
    
    res.json(quizzes);
  } catch (error) { res.json([]); }
});

// D. Get Single Quiz
app.get('/api/quizzes/:id', (req, res) => {
  try {
    const filePath = path.join(QUIZ_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Quiz not found' });
    const quiz = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(quiz);
  } catch (error) { res.status(500).json({ error: 'Failed to load quiz' }); }
});

// E. Create / Update Quiz
app.post('/api/quizzes', (req, res) => {
  const { id, title, schedule, questions } = req.body;
  if (!id || !title) return res.status(400).json({ error: 'Invalid Data' });

  const filePath = path.join(QUIZ_DIR, `${id}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify({ id, title, schedule, questions }, null, 2));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to save quiz' }); }
});

// F. Delete Quiz
app.delete('/api/quizzes/:id', (req, res) => {
  const quizPath = path.join(QUIZ_DIR, `${req.params.id}.json`);
  const resultPath = path.join(DATA_DIR, `${req.params.id}.json`);
  try {
    if (fs.existsSync(quizPath)) fs.unlinkSync(quizPath);
    if (fs.existsSync(resultPath)) fs.unlinkSync(resultPath);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete quiz' }); }
});

// G. Check Attempt (Prevent Retake)
app.post('/api/check-attempt', (req, res) => {
  const { quizId, prn } = req.body;
  const filePath = path.join(DATA_DIR, `${quizId}.json`);
  
  if (!fs.existsSync(filePath)) return res.json({ attempted: false });

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const hasAttempted = data.some(entry => entry.prn === prn);
    res.json({ attempted: hasAttempted });
  } catch (error) { res.json({ attempted: false }); }
});

// H. Submit Score
app.post('/api/submit-score', (req, res) => {
  const { quizId, studentName, year, prn, score, totalMarks, status } = req.body;
  const filePath = path.join(DATA_DIR, `${quizId}.json`);

  const newEntry = {
    studentName: studentName || 'Anonymous',
    year: year || 'N/A',
    prn: prn || 'N/A',
    score,
    totalMarks,
    status,
    submittedAt: new Date().toISOString()
  };

  try {
    let data = [];
    if (fs.existsSync(filePath)) {
      try { data = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) {}
    }
    
    // Prevent duplicates server-side
    if(data.some(d => d.prn === prn)) return res.json({ success: false, message: "Already submitted" });

    data.push(newEntry);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// I. Leaderboard
app.get('/api/leaderboard/:quizId', (req, res) => {
  const filePath = path.join(DATA_DIR, `${req.params.quizId}.json`);

  if (!fs.existsSync(filePath)) return res.json([]);

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // Sort: High Score -> Fast Time
    data.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(a.submittedAt) - new Date(b.submittedAt);
    });
    res.json(data);
  } catch (error) { res.json([]); }
});

// J. Code Compiler (Robust Wrapper)
app.post('/api/run-code', async (req, res) => {
  let { language, sourceCode, input } = req.body;
  
  const runtimes = {
    python: { language: 'python', version: '3.10.0' },
    javascript: { language: 'javascript', version: '18.15.0' },
    c: { language: 'c', version: '10.2.0' },
    cpp: { language: 'c++', version: '10.2.0' },
    java: { language: 'java', version: '15.0.2' },
  };

  const runtime = runtimes[language];
  if (!runtime) return res.status(400).json({ error: "Unsupported Language" });

  // --- AUTOMATIC CODE WRAPPING LOGIC ---
  
  // 1. JAVA: Wrap raw logic into Main class
  if (language === 'java') {
    if (!sourceCode.includes('class ')) {
      // Extract imports
      const imports = sourceCode.match(/import\s+[\w\.]+;/g) || [];
      const body = sourceCode.replace(/import\s+[\w\.]+;/g, '').trim();
      
      sourceCode = `
import java.util.*;
import java.io.*;
import java.math.*;
${imports.join('\n')}

public class Main {
    public static void main(String[] args) {
        try {
            Scanner scanner = new Scanner(System.in);
            ${body}
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}`;
    }
  } 
  
  // 2. C/C++: Move includes to top, wrap logic in main()
  else if (language === 'c' || language === 'cpp') {
    if (!sourceCode.includes('main(')) {
       const lines = sourceCode.split('\n');
       const headers = lines.filter(line => line.trim().startsWith('#'));
       const body = lines.filter(line => !line.trim().startsWith('#')).join('\n');

       const defaultHeaders = language === 'c' 
         ? '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <math.h>\n' 
         : '#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <map>\n#include <set>\n#include <string>\nusing namespace std;\n';

       sourceCode = `${defaultHeaders}\n${headers.join('\n')}\n\nint main() {\n${body}\nreturn 0;\n}`;
    }
  }

  // Python and JS are executed as-is.

  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: runtime.language,
      version: runtime.version,
      files: [{ content: sourceCode }],
      stdin: input || "",
    });
    res.json(response.data);
  } catch (error) {
    console.error("Compiler Error:", error.message);
    res.status(500).json({ error: "Failed to execute code" });
  }
});

// --- 5. START SERVER ---
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
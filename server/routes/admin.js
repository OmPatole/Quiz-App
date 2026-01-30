const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const csv = require('csv-parser');
const { Admin, Student, StudentBatch, Result } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ==========================================
// 1. STUDENT MANAGEMENT (The missing link)
// ==========================================

// GET /api/admin/students?year=2026
// This is the route your Frontend StudentManager is trying to call
router.get('/admin/students', authenticateToken, async (req, res) => {
    try {
        const { year } = req.query; // e.g., "2026"
        
        const query = {};
        // Filter by Graduation Year if provided
        if (year) query.gradYear = year; 

        // Return sorted by Name
        const students = await Student.find(query).sort({ name: 1 });
        res.json(students);
    } catch (e) {
        console.error("Fetch Error:", e);
        res.status(500).json({ error: "Failed to fetch students" });
    }
});

// POST /api/admin/students/filter (Advanced Filter)
router.post('/admin/students/filter', authenticateToken, async (req, res) => {
    try {
        const { gradYear, academicYear, type } = req.body;
        const query = {};

        if (type === 'self-signup') {
            query.registrationType = 'self-signup';
        } else {
            // Default to official admin-uploads if not specified
            if (gradYear) query.gradYear = gradYear;
        }

        if (academicYear) query.year = academicYear;

        const students = await Student.find(query).sort({ branch: 1, name: 1 });
        res.json(students);
    } catch (e) { res.status(500).json({ error: "Fetch Failed" }); }
});

// ==========================================
// 2. BATCH & UPLOAD
// ==========================================

// Get List of Graduation Years (For Sidebar)
router.get('/admin/grad-years', authenticateToken, async (req, res) => {
    try {
        const years = await Student.distinct('gradYear');
        res.json(years.filter(y => y).sort());
    } catch (e) { res.status(500).json({ error: "Fetch Failed" }); }
});

// Upload CSV Batch
router.post('/admin/upload-students', authenticateToken, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No CSV' });
    
    // Default Grad Year logic
    const match = req.file.originalname.match(/20\d{2}/);
    const defaultGradYear = match ? match[0] : (new Date().getFullYear() + 4).toString();

    try {
        const newBatch = await StudentBatch.create({ 
            batchName: req.file.originalname, 
            type: 'official',
            studentCount: 0 
        });
        
        const studentsToProcess = [];
        
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (data) => {
              // Normalize keys to lowercase trim
              const clean = {}; 
              Object.keys(data).forEach(k => clean[k.trim().toLowerCase()] = data[k].trim());
              
              if(clean.name && clean.prn) {
                  studentsToProcess.push({ 
                      ...clean, 
                      batchId: newBatch._id,
                      registrationType: 'admin-upload',
                      gradYear: clean.gradyear || defaultGradYear 
                  });
              }
          })
          .on('end', async () => {
            try {
              if (studentsToProcess.length === 0) {
                   await StudentBatch.findByIdAndDelete(newBatch._id);
                   fs.unlinkSync(req.file.path);
                   return res.status(400).json({ error: "Empty CSV or Invalid Headers" });
              }

              const bulkOps = studentsToProcess.map(s => ({
                  updateOne: {
                      filter: { prn: s.prn },
                      update: { $set: s }, 
                      upsert: true
                  }
              }));
              
              await Student.bulkWrite(bulkOps);
              await StudentBatch.findByIdAndUpdate(newBatch._id, { studentCount: studentsToProcess.length });
              
              fs.unlinkSync(req.file.path);
              res.json({ success: true, message: "Upload Complete" });
            } catch (e) { 
                console.error(e);
                if(fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); 
                res.status(500).json({ error: "Import Failed" }); 
            }
          });
    } catch (e) { 
        if(fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); 
        res.status(500).json({ error: "Batch Failed" }); 
    }
});

// ==========================================
// 3. ADMIN ACCOUNTS
// ==========================================

router.get('/admins', authenticateToken, async (req, res) => {
    if (req.user.role !== 'superadmin') return res.status(403).json({ error: "Denied" });
    try {
        const admins = await Admin.find({}, '-password');
        res.json(admins);
    } catch (e) { res.status(500).json({ error: "Fetch Failed" }); }
});

router.post('/create-admin', authenticateToken, async (req, res) => {
    if (req.user.role !== 'superadmin') return res.status(403).json({ error: "Only Super Admin" });
    try {
        const { username, password } = req.body;
        if (await Admin.findOne({ username })) return res.status(400).json({ error: "Username taken" });
        const hash = await bcrypt.hash(password, 10);
        await Admin.create({ username, password: hash, role: 'admin' });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Failed" }); }
});

// ==========================================
// 4. STATS
// ==========================================

router.get('/admin/student-stats/:prn', authenticateToken, async (req, res) => {
    try {
        const { prn } = req.params;
        const results = await Result.find({ prn }).sort({ submittedAt: -1 });
        
        const totalTests = results.length;
        const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
        const maxTotalMarks = results.reduce((acc, curr) => acc + (curr.totalMarks || 100), 0);
        
        const avgScore = totalTests ? Math.round((totalScore / totalTests)) : 0;
        const accuracy = totalTests ? Math.round((totalScore / maxTotalMarks) * 100) : 0;
        
        // Activity Map for Heatmap
        const activityMap = {}; 
        results.forEach(r => {
            const date = r.submittedAt.toISOString().split('T')[0];
            activityMap[date] = (activityMap[date] || 0) + 1;
        });

        res.json({
            stats: { totalTests, avgScore, accuracy },
            activityMap,
            recentActivity: results.slice(0, 5)
        });
    } catch (e) { res.status(500).json({ error: "Stats Fetch Failed" }); }
});

module.exports = router;
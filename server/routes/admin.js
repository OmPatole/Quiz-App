const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const csv = require('csv-parser');
const { Admin, Student, StudentBatch, Result } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ==========================================
// 1. ADMIN ACCOUNT MANAGEMENT
// ==========================================
router.post('/admin/students/filter', authenticateToken, async (req, res) => {
    try {
        const { gradYear, academicYear } = req.body;
        const query = {};

        // Filter by Class (Graduation Year)
        // This unifies "Admin Upload" and "Self Signup" because both have gradYear
        if (gradYear) query.gradYear = gradYear;
        
        // Filter by Current Academic Year
        if (academicYear) query.year = academicYear;

        // Sort by Branch first, then Name
        const students = await Student.find(query).sort({ branch: 1, name: 1 });
        res.json(students);
    } catch (e) { res.status(500).json({ error: "Fetch Failed" }); }
});
// Get all admins (Superadmin only)
router.get('/admins', authenticateToken, async (req, res) => {
    if (req.user.role !== 'superadmin') return res.status(403).json({ error: "Denied" });
    try {
        const admins = await Admin.find({}, '-password');
        res.json(admins);
    } catch (e) { res.status(500).json({ error: "Fetch Failed" }); }
});

// Create new admin
router.post('/create-admin', authenticateToken, async (req, res) => {
    if (req.user.role !== 'superadmin') return res.status(403).json({ error: "Only Super Admin" });
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "Missing fields" });
        if (await Admin.findOne({ username })) return res.status(400).json({ error: "Username taken" });

        const hash = await bcrypt.hash(password, 10);
        await Admin.create({ username, password: hash, role: 'admin' });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Failed" }); }
});

// Delete admin
router.delete('/admin/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'superadmin') return res.status(403).json({ error: "Denied" });
    try {
        await Admin.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Delete Failed" }); }
});

// ==========================================
// 2. STUDENT & BATCH MANAGEMENT
// ==========================================

// Get all batches (Legacy view)
router.get('/admin/batches', authenticateToken, async (req, res) => {
    try {
        const batches = await StudentBatch.find().sort({ uploadedAt: -1 });
        res.json(batches);
    } catch (e) { res.status(500).json({ error: "Fetch Failed" }); }
});

// Get students in a specific batch (Legacy view)
router.get('/admin/batches/:batchId/students', authenticateToken, async (req, res) => {
    try {
        const students = await Student.find({ batchId: req.params.batchId });
        res.json(students);
    } catch (e) { res.status(500).json({ error: "Fetch Failed" }); }
});

// --- NEW HIERARCHICAL MANAGEMENT ROUTES ---

// Get List of Graduation Years (Left Sidebar)
router.get('/admin/grad-years', authenticateToken, async (req, res) => {
    try {
        // Distinct years from students
        const years = await Student.distinct('gradYear');
        // Filter out nulls/undefined and sort
        res.json(years.filter(y => y).sort());
    } catch (e) { res.status(500).json({ error: "Fetch Failed" }); }
});

// Filter Students (Main View)
router.post('/admin/students/filter', authenticateToken, async (req, res) => {
    try {
        const { gradYear, academicYear, type } = req.body;
        const query = {};

        // If explicitly asking for self-signup
        if (type === 'self-signup') {
            query.registrationType = 'self-signup';
        } else {
            // Default to official admin-uploads
            query.registrationType = 'admin-upload';
            if (gradYear) query.gradYear = gradYear;
        }

        if (academicYear) query.year = academicYear;

        // Sort by Branch first, then Name
        const students = await Student.find(query).sort({ branch: 1, name: 1 });
        res.json(students);
    } catch (e) { res.status(500).json({ error: "Fetch Failed" }); }
});

// Upload Students via CSV
router.post('/admin/upload-students', authenticateToken, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No CSV' });
    
    // Extract Grad Year from filename if possible (e.g., "Batch_2026.csv")
    // If not found, default to Current Year + 4 (Approx graduation for incoming batch)
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
              // Normalize keys
              const clean = {}; 
              Object.keys(data).forEach(k => clean[k.trim().toLowerCase()] = data[k].trim());
              
              if(clean.name && clean.prn) {
                  studentsToProcess.push({ 
                      ...clean, 
                      batchId: newBatch._id,
                      registrationType: 'admin-upload',
                      // Use CSV column 'gradyear' if exists, else inferred
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

              // Bulk Write with Upsert
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

// Delete a batch and its students
router.delete('/admin/batches/:batchId', authenticateToken, async (req, res) => {
    try {
        await Student.deleteMany({ batchId: req.params.batchId });
        await StudentBatch.findByIdAndDelete(req.params.batchId);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Delete Failed" }); }
});

// Delete a single student
router.delete('/admin/students/:id', authenticateToken, async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Delete Failed" }); }
});

// ==========================================
// 3. ANALYTICS & MONITORING
// ==========================================

// Get Login Activity (Sorted by Last Login)
router.get('/admin/login-activity', authenticateToken, async (req, res) => {
    try {
        const students = await Student.find({ lastLogin: { $exists: true } })
            .sort({ lastLogin: -1 })
            .limit(50)
            .select('name prn year branch lastLogin');
        res.json(students);
    } catch (e) { res.status(500).json({ error: "Fetch Failed" }); }
});

// Get Individual Student Stats
router.get('/admin/student-stats/:prn', authenticateToken, async (req, res) => {
    try {
        const { prn } = req.params;
        const results = await Result.find({ prn }).sort({ submittedAt: -1 });
        
        // Calculate Stats
        const totalTests = results.length;
        const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
        const maxTotalMarks = results.reduce((acc, curr) => acc + (curr.totalMarks || 100), 0);
        
        const avgScore = totalTests ? Math.round((totalScore / totalTests)) : 0;
        const accuracy = totalTests ? Math.round((totalScore / maxTotalMarks) * 100) : 0;
        
        // Activity Map
        const activityMap = {}; 
        results.forEach(r => {
            const date = r.submittedAt.toISOString().split('T')[0];
            activityMap[date] = (activityMap[date] || 0) + 1;
        });

        const bestResult = results.length > 0 ? results.reduce((prev, current) => (prev.score > current.score) ? prev : current) : null;

        res.json({
            stats: { totalTests, avgScore, accuracy, bestScore: bestResult ? bestResult.score : 0 },
            activityMap,
            recentActivity: results.slice(0, 5)
        });
    } catch (e) { res.status(500).json({ error: "Stats Fetch Failed" }); }
});

module.exports = router;
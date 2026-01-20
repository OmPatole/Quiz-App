const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const csv = require('csv-parser');
const { Admin, Student, StudentBatch } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// --- ADMIN MANAGEMENT ---
router.get('/admins', authenticateToken, async (req, res) => {
    if (req.user.role !== 'superadmin') return res.status(403).json({ error: "Denied" });
    const admins = await Admin.find({}, '-password');
    res.json(admins);
});

router.post('/create-admin', authenticateToken, async (req, res) => {
    if (req.user.role !== 'superadmin') return res.status(403).json({ error: "Only Super Admin" });
    try {
        const { username, password, scope } = req.body;
        if (!username || !password || !scope) return res.status(400).json({ error: "Missing fields" });
        if (await Admin.findOne({ username })) return res.status(400).json({ error: "Username taken" });

        const hash = await bcrypt.hash(password, 10);
        await Admin.create({ username, password: hash, role: 'admin', scope });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.delete('/admin/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'superadmin') return res.status(403).json({ error: "Denied" });
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// --- BATCH MANAGEMENT ---
router.get('/admin/batches', authenticateToken, async (req, res) => {
    let filter = {};
    const userScope = req.user.scope || 'all';
    if (userScope !== 'all') filter.category = userScope;
    const batches = await StudentBatch.find(filter).sort({ uploadedAt: -1 });
    res.json(batches);
});

router.get('/admin/batches/:batchId/students', authenticateToken, async (req, res) => {
    const students = await Student.find({ batchId: req.params.batchId });
    res.json(students);
});

// --- SMART MERGE UPLOAD ROUTE ---
router.post('/admin/upload-students', authenticateToken, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No CSV' });
    
    // 1. Determine Target Category (Where we are uploading TO)
    let targetCategory = req.body.category;
    if (!targetCategory || targetCategory === 'undefined' || targetCategory === 'null') targetCategory = 'aptitude';
    if (req.user.scope && req.user.scope !== 'all') targetCategory = req.user.scope;

    try {
        const newBatch = await StudentBatch.create({ batchName: req.file.originalname, category: targetCategory, studentCount: 0 });
        const studentsToProcess = [];
        
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (data) => {
              const clean = {}; Object.keys(data).forEach(k => clean[k.trim().toLowerCase()] = data[k].trim());
              if(clean.name && clean.prn) {
                  studentsToProcess.push({ ...clean, batchId: newBatch._id });
              }
          })
          .on('end', async () => {
            try {
              if (studentsToProcess.length === 0) {
                   await StudentBatch.findByIdAndDelete(newBatch._id);
                   fs.unlinkSync(req.file.path);
                   return res.status(400).json({ error: "Empty CSV" });
              }

              // --- SMART MERGE LOGIC ---
              const bulkOps = [];
              const prns = studentsToProcess.map(s => s.prn);
              
              // Find existing students to check their current category
              const existingStudents = await Student.find({ prn: { $in: prns } });
              const existingMap = {};
              existingStudents.forEach(s => existingMap[s.prn] = s.category);

              studentsToProcess.forEach(s => {
                  const currentCat = existingMap[s.prn]; 
                  let finalCat = targetCategory;

                  // LOGIC: If existing category is different (and not null), upgrade to 'both'
                  if (currentCat && currentCat !== 'both' && currentCat !== targetCategory) {
                      finalCat = 'both'; 
                  } else if (currentCat === 'both') {
                      finalCat = 'both'; 
                  }

                  bulkOps.push({
                      updateOne: {
                          filter: { prn: s.prn },
                          update: { $set: { ...s, category: finalCat } }, 
                          upsert: true
                      }
                  });
              });
              
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
    } catch (e) { if(fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); res.status(500).json({ error: "Batch Creation Failed" }); }
});

router.delete('/admin/batches/:batchId', authenticateToken, async (req, res) => {
    await Student.deleteMany({ batchId: req.params.batchId });
    await StudentBatch.findByIdAndDelete(req.params.batchId);
    res.json({ success: true });
});

module.exports = router;
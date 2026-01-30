const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin, Student, StudentBatch } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');

// --- ADMIN LOGIN ---
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Admin.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role, scope: user.scope }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, username: user.username, role: user.role });
  } catch (e) { res.status(500).json({ error: "Server Error" }); }
});

// --- STUDENT LOGIN ---
router.post('/student/login', async (req, res) => {
  try {
    const { prn, name } = req.body;
    if (!prn) return res.status(400).json({ error: "PRN is required" });

    const student = await Student.findOne({ prn: { $regex: new RegExp(`^${prn.trim()}$`, "i") } });
    if (!student) return res.status(404).json({ error: "Student not found. Please Sign Up." });
    
    // Update login stats
    student.lastLogin = new Date();
    await student.save();

    const token = jwt.sign({ id: student._id, prn: student.prn, role: 'student' }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, student });
  } catch (e) { res.status(500).json({ error: "Login Error" }); }
});

// --- STUDENT SIGNUP (Self-Registration) ---
router.post('/student/signup', async (req, res) => {
  try {
    const { name, prn, year, branch } = req.body;
    
    if (await Student.findOne({ prn: { $regex: new RegExp(`^${prn.trim()}$`, "i") } })) {
        return res.status(400).json({ error: "PRN already registered." });
    }

    // Assign to a special 'Self Registered' batch
    let selfBatch = await StudentBatch.findOne({ type: 'self-reg' });
    if (!selfBatch) {
        selfBatch = await StudentBatch.create({ batchName: 'Self Registered Students', type: 'self-reg', studentCount: 0 });
    }

    // Determine Grad Year roughly (Current Year + Remaining Years)
    const currentYear = new Date().getFullYear();
    let gradYear = currentYear + 4; 
    if(year === 'First Year') gradYear = currentYear + 3;
    if(year === 'Second Year') gradYear = currentYear + 2;
    if(year === 'Third Year') gradYear = currentYear + 1;
    if(year === 'Fourth Year') gradYear = currentYear;

    const newStudent = await Student.create({
        name,
        prn: prn.trim(),
        year,
        branch,
        batchId: selfBatch._id,
        registrationType: 'self-signup', // <--- MARKED SEPARATELY
        gradYear: gradYear.toString(),
        lastLogin: new Date()
    });

    await StudentBatch.findByIdAndUpdate(selfBatch._id, { $inc: { studentCount: 1 } });

    const token = jwt.sign({ id: newStudent._id, prn: newStudent.prn, role: 'student' }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, student: newStudent });

  } catch (e) { res.status(500).json({ error: "Registration Failed" }); }
});

module.exports = router;
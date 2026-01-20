const express = require('express');
const router = express.Router(); // <--- This was missing
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin, Student } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');

// --- ADMIN LOGIN (With Debugging) ---
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`[Login Attempt] User: ${username}`); // DEBUG LOG

    const user = await Admin.findOne({ username });
    
    if (!user) {
        console.log("❌ User not found in DB");
        return res.status(401).json({ error: "Invalid credentials (User not found)" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log("❌ Password did not match");
        return res.status(401).json({ error: "Invalid credentials (Wrong password)" });
    }

    console.log("✅ Login Success!");
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role, scope: user.scope }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, username: user.username, role: user.role, scope: user.scope });
  } catch (e) { 
      console.error("Login Error:", e);
      res.status(500).json({ error: "Server Error" }); 
  }
});

// --- STUDENT LOGIN ---
router.post('/student/login', async (req, res) => {
  try {
    const { name, prn, branch, year } = req.body;
    if (!name || !prn || !branch || !year) return res.status(400).json({ error: "All fields required" });

    const student = await Student.findOne({ prn: { $regex: new RegExp(`^${prn.trim()}$`, "i") } });
    if (!student) return res.status(404).json({ error: "PRN not found." });
    
    if (student.name.toLowerCase().trim() !== name.toLowerCase().trim()) return res.status(401).json({ error: "Name mismatch." });
    if (student.branch.toLowerCase() !== branch.toLowerCase()) return res.status(401).json({ error: "Branch mismatch." });
    if (student.year !== year) return res.status(401).json({ error: "Year mismatch." });

    // Determine category based on database record (default to aptitude if missing)
    const category = student.category || 'aptitude';

    const token = jwt.sign({ 
        id: student._id, prn: student.prn, category: category, role: 'student' 
    }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ success: true, token, student });
  } catch (e) { res.status(500).json({ error: "Login Error" }); }
});

module.exports = router; // <--- This exports the router so index.js can use it
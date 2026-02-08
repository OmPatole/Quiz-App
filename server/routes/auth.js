const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST /api/session/signin
// @desc    User signin and return JWT
// @access  Public
router.post('/signin', async (req, res) => {
    try {
        const { prn, password } = req.body;

        // Validate input
        if (!prn || !password) {
            return res.status(400).json({ message: 'Please provide PRN and password' });
        }

        // Check if user exists
        const user = await User.findOne({ prn });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create JWT payload
        const payload = {
            id: user._id,
            role: user.role
        };

        // Set expiration based on role (Admin: 2h, Student: 30d)
        const expiresIn = user.role === 'Admin' ? '2h' : '30d';

        // Sign token
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn
        });

        // Set headers to avoid tracker detection
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                prn: user.prn,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/setup/create-admin
// @desc    Create initial admin user (should be disabled in production)
// @access  Public (DISABLE THIS IN PRODUCTION!)
router.post('/create-admin', async (req, res) => {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ prn: 'ADMIN' });

        if (existingAdmin) {
            return res.status(400).json({
                message: 'Admin user already exists',
                credentials: {
                    prn: 'ADMIN',
                    note: 'Use existing password or delete the admin user to recreate'
                }
            });
        }

        // Create admin user
        const admin = new User({
            name: 'Administrator',
            prn: 'ADMIN',
            password: 'admin123', // Will be hashed by pre-save hook
            role: 'Admin'
        });

        await admin.save();

        res.json({
            success: true,
            message: 'Admin user created successfully!',
            credentials: {
                prn: 'ADMIN',
                password: 'admin123'
            }
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

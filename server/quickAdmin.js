// Quick Admin Creation Script
// Run this with: node quickAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/quiz-app');
        console.log('✅ Connected to MongoDB');

        // Define User schema inline
        const userSchema = new mongoose.Schema({
            name: String,
            prn: String,
            password: String,
            role: String,
            academicYear: String,
            branch: String,
            batchYear: String,
            currentStreak: Number,
            longestStreak: Number,
            lastQuizDate: Date
        }, { timestamps: true });

        const User = mongoose.model('User', userSchema);

        // Check if admin exists
        const existing = await User.findOne({ prn: 'ADMIN' });
        if (existing) {
            console.log('⚠️  Admin already exists!');
            console.log('PRN: ADMIN');
            console.log('If you forgot the password, delete the admin user and run this again.');
            await mongoose.connection.close();
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Create admin
        const admin = new User({
            name: 'Administrator',
            prn: 'ADMIN',
            password: hashedPassword,
            role: 'Admin',
            currentStreak: 0,
            longestStreak: 0
        });

        await admin.save();
        console.log('✅ Admin user created successfully!');
        console.log('');
        console.log('Login Credentials:');
        console.log('PRN: ADMIN');
        console.log('Password: admin123');
        console.log('');
        console.log('You can now login at http://localhost:80/login');

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdmin();

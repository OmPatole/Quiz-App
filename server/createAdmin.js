const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app');
        console.log('MongoDB Connected');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ prn: 'ADMIN' });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('PRN: ADMIN');
            console.log('You can update the password if needed.');
            process.exit(0);
        }

        // Create admin user
        const admin = new User({
            name: 'Administrator',
            prn: 'ADMIN',
            password: 'admin123', // This will be hashed by the pre-save hook
            role: 'Admin'
        });

        await admin.save();
        console.log('✅ Admin user created successfully!');
        console.log('PRN: ADMIN');
        console.log('Password: admin123');
        console.log('\nYou can now login with these credentials.');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser();

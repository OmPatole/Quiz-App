require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ prn: 'ADMIN' });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            process.exit(0);
        }

        // Create admin user
        const admin = new User({
            name: 'Admin User',
            prn: 'ADMIN',
            password: 'admin123', // Will be hashed automatically by the pre-save hook
            role: 'Admin'
        });

        await admin.save();
        console.log('✅ Admin user created successfully!');
        console.log('PRN: ADMIN');
        console.log('Password: admin123');
        console.log('\n⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();

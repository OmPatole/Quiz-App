const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const secureAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app');
        console.log('✅ Connected to MongoDB');

        // Delete the insecure default admin
        const result = await User.deleteMany({ prn: 'ADMIN' });
        if (result.deletedCount > 0) {
            console.log(`⚠️  Deleted ${result.deletedCount} insecure 'ADMIN' accounts.`);
        }

        // Check if secure admin exists
        const exists = await User.findOne({ prn: 'SYS_ADMIN' });
        if (exists) {
            console.log('✅ Secure System Administrator already exists.');
            process.exit(0);
        }

        // Create Secure Admin
        const secureAdmin = new User({
            name: 'System Administrator',
            prn: 'SYS_ADMIN',
            password: 'Secure_Admin_2026!',
            role: 'Admin'
        });

        await secureAdmin.save();

        console.log('\n🔒 SECURITY UPGRADE COMPLETE 🔒');
        console.log('--------------------------------');
        console.log('New Admin Credentials:');
        console.log('PRN:      SYS_ADMIN');
        console.log('Password: Secure_Admin_2026!');
        console.log('--------------------------------');
        console.log('Policy:   Session-Only (No persistent login)');
        console.log('Token:    Expires in 2 hours');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error securing admin:', error);
        process.exit(1);
    }
};

secureAdmin();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

console.log('Script started');

const fixAdmin = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app';
        console.log('Connecting to: ' + uri);
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const userSchema = new mongoose.Schema({
            name: { type: String, required: true },
            prn: { type: String },
            email: { type: String },
            password: { type: String, required: true },
            role: { type: String, default: 'Student' },
            currentStreak: { type: Number, default: 0 },
            longestStreak: { type: Number, default: 0 }
        }, { timestamps: true });

        const User = mongoose.model('User', userSchema);

        // 1. Delete broken admin (missing prn, or prn undefined)
        const brokenAdminResult = await User.deleteMany({ role: 'Admin', prn: { $exists: false } });
        console.log(`Deleted ${brokenAdminResult.deletedCount} admin users (missing PRN).`);

        // 2. Check if ADMIN exists, if so delete it to reset password
        const existingAdmin = await User.findOne({ prn: 'ADMIN' });
        if (existingAdmin) {
            await User.deleteOne({ prn: 'ADMIN' });
            console.log('Deleted existing ADMIN user (resetting password).');
        }

        // 3. Create new Admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const newAdmin = new User({
            name: 'Administrator',
            prn: 'ADMIN',
            password: hashedPassword,
            role: 'Admin',
            currentStreak: 0,
            longestStreak: 0
        });

        await newAdmin.save();
        console.log('Created new Admin user:');
        console.log('  PRN: ADMIN');
        console.log('  Password: admin123');

        // Also ensure SYS_ADMIN exists just in case
        const sysAdmin = await User.findOne({ prn: 'SYS_ADMIN' });
        if (sysAdmin) {
            console.log('SYS_ADMIN user exists (no changes made to it).');
        }

    } catch (error) {
        console.error('Error fixing admin:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

fixAdmin();

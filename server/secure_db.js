const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define User Schema inline to avoid dependency issues
const userSchema = new mongoose.Schema({
    name: String,
    prn: String,
    password: String,
    role: String
}, { timestamps: true });

// Pre-save hook for password hashing
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

const secureAdmin = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/quiz-app');
        console.log('✅ Connected to MongoDB');

        // Delete the insecure default admin
        const deleteResult = await User.deleteMany({ prn: 'ADMIN' });
        if (deleteResult.deletedCount > 0) {
            console.log(`⚠️  Deleted insecure 'ADMIN' account.`);
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
            password: 'Secure_Admin_2026!', // Hashed automatically
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

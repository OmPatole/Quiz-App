const User = require('../models/User');

/**
 * Initialize default admin user if it doesn't exist
 * This runs automatically when the server starts
 */
// Initialize secure admin user if it doesn't exist
const initializeAdmin = async () => {
    try {
        // 1. Remove insecure default admin if it exists
        const insecureAdmin = await User.findOne({ prn: 'ADMIN' });
        if (insecureAdmin) {
            await User.deleteOne({ prn: 'ADMIN' });
            console.log('⚠️  Removed insecure default admin (ADMIN)');
        }

        // 2. Check if secure admin exists
        const adminExists = await User.findOne({ prn: 'SYS_ADMIN' });

        if (adminExists) {
            if (!adminExists.email) {
                adminExists.email = 'testmail@gmail.com';
                await adminExists.save();
                console.log('✅ Secure System Administrator exists (Updated email to testmail@gmail.com)');
            } else {
                console.log('✅ Secure System Administrator exists');
            }
            return;
        }

        // 3. Create secure admin user
        const admin = new User({
            name: 'System Administrator',
            prn: 'SYS_ADMIN',
            email: 'testmail@gmail.com',
            password: 'Secure_Admin_2026!', // Will be hashed by pre-save hook
            role: 'Admin'
        });

        await admin.save();
        console.log('🔒 Secure System Administrator created');
        console.log('   PRN: SYS_ADMIN');
        console.log('   Email: testmail@gmail.com');
        console.log('   Password: Secure_Admin_2026!');
        console.log('   Policy: 2-hour session (No permanent login)');
    } catch (error) {
        console.error('❌ Error initializing admin user:', error.message);
    }
};

module.exports = { initializeAdmin };

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Connect to Database (Ensure URI matches your index.js)
const MONGO_URI = 'mongodb://localhost:27017/quiz_app_db';

const resetAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to DB');

        // 2. Define Schema manually to avoid import issues
        const AdminSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            role: { type: String, default: 'admin' },
            scope: { type: String, default: 'all' }
        });
        const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

        // 3. Delete existing 'admin' user
        await Admin.deleteOne({ username: 'admin' });
        console.log('🗑️  Old admin removed');

        // 4. Create NEW Admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await Admin.create({
            username: 'admin',
            password: hashedPassword,
            role: 'superadmin',
            scope: 'all'
        });

        console.log('🎉 SUCCESS: Admin reset!');
        console.log('👉 Username: admin');
        console.log('👉 Password: admin123');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

resetAdmin();
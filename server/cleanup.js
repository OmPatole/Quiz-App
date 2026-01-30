const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Configuration
const MONGO_URI = 'mongodb://localhost:27017/quiz_app_db';

const resetDatabase = async () => {
    try {
        // 1. Connect to Database
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to Database');

        // 2. DROP THE ENTIRE DATABASE
        // This removes all collections (Students, Quizzes, Results, etc.)
        await mongoose.connection.db.dropDatabase();
        console.log('🔥 Database completely wiped (All collections deleted)');

        // 3. Re-Create the Super Admin (Required to login)
        // We define the schema inline to avoid dependency issues with models.js
        const AdminSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            role: { type: String, default: 'admin' }, 
            scope: { type: String, default: 'all' },
            createdAt: { type: Date, default: Date.now }
        });

        const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await Admin.create({
            username: 'admin',
            password: hashedPassword,
            role: 'superadmin', // Important: Must be superadmin
            scope: 'all'
        });

        console.log('✨ Fresh Super Admin created successfully');
        console.log('------------------------------------------------');
        console.log('👤 Username: admin');
        console.log('🔑 Password: admin123');
        console.log('------------------------------------------------');

        process.exit(0);

    } catch (err) {
        console.error('❌ Error resetting database:', err);
        process.exit(1);
    }
};

resetDatabase();
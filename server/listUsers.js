const mongoose = require('mongoose');
require('dotenv').config();

console.log('Script started');

const listUsers = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app';
        console.log('Connecting to: ' + uri);
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const userSchema = new mongoose.Schema({
            name: String,
            prn: String,
            role: String,
        }, { strict: false });

        const User = mongoose.model('User', userSchema);

        // Find users with role Admin
        const users = await User.find({ role: 'Admin' });
        console.log('\n--- Admin Users ---');
        users.forEach(u => {
            console.log(JSON.stringify(u, null, 2));
        });
        console.log('-------------------\n');
    } catch (error) {
        console.error('Error listing users:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

listUsers();

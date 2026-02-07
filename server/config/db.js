const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Fix: Drop stale 'email_1' index if it exists (causes duplicate key errors on student creation)
        try {
            const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
            if (collections.length > 0) {
                const indexes = await mongoose.connection.db.collection('users').indexes();
                if (indexes.find(idx => idx.name === 'email_1')) {
                    console.log('Detected stale unique index "email_1". Dropping to resolve conflicts...');
                    await mongoose.connection.db.collection('users').dropIndex('email_1');
                    console.log('Stale index "email_1" dropped successfully.');
                }
            }
        } catch (err) {
            console.error('Warning: Failed to check/drop stale index:', err.message);
        }

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

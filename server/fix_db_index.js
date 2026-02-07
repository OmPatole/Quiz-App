const mongoose = require('mongoose');

// Hardcoded URI to avoid dotenv issues in this standalone script
const MONGO_URI = 'mongodb://localhost:27017/quiz-app';

console.log('Script started...');

const fixDatabaseIndexes = async () => {
    try {
        console.log('Connecting to MongoDB at:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        try {
            // Drop the problematic `email_1` index from the `users` collection
            console.log('Attempting to drop `email_1` index...');
            if (mongoose.connection.db) {
                const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
                if (collections.length > 0) {
                    const indexes = await mongoose.connection.db.collection('users').indexes();
                    console.log('Current indexes:', indexes.map(i => i.name));

                    if (indexes.find(i => i.name === 'email_1')) {
                        await mongoose.connection.db.collection('users').dropIndex('email_1');
                        console.log('Successfully dropped `email_1` index.');
                    } else {
                        console.log('Index `email_1` not found in list.');
                    }
                } else {
                    console.log('Collection `users` not found.');
                }
            } else {
                console.log('Database connection not established properly.');
            }

        } catch (error) {
            console.error(`Error dropping index: ${error.message}`);
        }

        console.log('Database index cleanup complete.');
        process.exit(0);
    } catch (error) {
        console.error(`Fatal Error: ${error.message}`);
        process.exit(1);
    }
};

fixDatabaseIndexes();

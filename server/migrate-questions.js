require('dotenv').config({ path: require('path').resolve(__dirname, 'server', '.env') });
const mongoose = require('mongoose');

const migrate = async () => {
    try {
        console.log('Connecting to MongoDB...');
        // Connect directly to the DB string used in Quiz-App or assume one
        const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/quiz-app';
        await mongoose.connect(dbUri, );
        console.log('Connected.');
        
        const Question = require('./models/Question');
        const Quiz = require('./models/Quiz');

        // Using native MongoDB driver to bypass Mongoose schema casting for the update
        const db = mongoose.connection.db;
        const quizzesCollection = db.collection('quizzes');
        
        const quizzes = await quizzesCollection.find({}).toArray();
        console.log(`Found ${quizzes.length} quizzes to migrate.`);
        
        let migratedCount = 0;
        for (const quiz of quizzes) {
            if (!quiz.questions || quiz.questions.length === 0) continue;
            
            // Check if it's already an array of ObjectIds
            if (mongoose.Types.ObjectId.isValid(quiz.questions[0])) {
                continue;
            }
            
            console.log(`Migrating quiz ${quiz._id} (${quiz.title})...`);
            const questionIds = [];
            
            for (const q of quiz.questions) {
                // Ignore if it's somehow an ObjectId already
                if (mongoose.Types.ObjectId.isValid(q)) {
                    questionIds.push(new mongoose.Types.ObjectId(q));
                    continue;
                }
                
                // Use MongoDB native driver to insert the question
                // Or use Mongoose since we require Question model
                const newQ = new Question({
                    text: q.text,
                    marks: q.marks || 1,
                    options: q.options || [],
                    correctIndices: q.correctIndices || [],
                    explanation: q.explanation || '',
                    isMultiSelect: q.isMultiSelect || false
                });
                
                await newQ.save();
                questionIds.push(newQ._id);
            }
            
            // Update the quiz directly via native driver to avoid schema validation issues during migration
            await quizzesCollection.updateOne(
                { _id: quiz._id },
                { $set: { questions: questionIds } }
            );
            
            migratedCount++;
        }
        
        console.log(`Migration complete. Migrated ${migratedCount} quizzes.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();

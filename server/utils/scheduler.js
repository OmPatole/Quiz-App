const cron = require('node-cron');
const User = require('../models/User');
const QuizSession = require('../models/QuizSession');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const mongoose = require('mongoose');

const promoteAllStudents = async () => {
    try {
        console.log('Running Automatic Academic Year Rollover...');

        const transitions = [
            { from: 'Last Year', to: 'Graduated' },
            { from: 'Third Year', to: 'Last Year' },
            { from: 'Second Year', to: 'Third Year' },
            { from: 'First Year', to: 'Second Year' }
        ];

        let totalUpdated = 0;

        for (const transition of transitions) {
            const result = await User.updateMany(
                { academicYear: transition.from, role: 'Student' },
                { $set: { academicYear: transition.to } }
            );
            console.log(`Promoted ${result.modifiedCount} students from ${transition.from} to ${transition.to}`);
            totalUpdated += result.modifiedCount;
        }

        console.log(`Academic Rollover Complete. Total promoted: ${totalUpdated}`);
        return { success: true, count: totalUpdated };
    } catch (error) {
        console.error('Error during academic rollover:', error);
        return { success: false, error: error.message };
    }
};

const autoSubmitExpiredQuizzes = async () => {
    try {
        const sessions = await QuizSession.find({}).populate('quizId');
        const now = Date.now();

        for (const session of sessions) {
            const quiz = session.quizId;
            if (!quiz) {
                await QuizSession.findByIdAndDelete(session._id);
                continue;
            }

            let isExpired = false;
            
            // Check based on weekly quiz hard deadline
            if (quiz.quizType === 'weekly' && quiz.scheduledAt) {
                const deadline = new Date(quiz.scheduledAt).getTime() + (quiz.duration || 0) * 60000;
                if (now >= deadline) {
                    isExpired = true;
                }
            }

            // Check based on time left per student (with a grace period of 2 minutes)
            const sessionExpirationTime = new Date(session.lastUpdated).getTime() + session.timeLeft * 1000 + 120000;
            if (now >= sessionExpirationTime) {
                isExpired = true;
            }

            if (isExpired) {
                await processQuizSubmission(session, quiz);
            }
        }
    } catch (error) {
        console.error('Error auto-submitting expired quizzes:', error);
    }
};

const processQuizSubmission = async (session, quiz) => {
    try {
        // Construct standard answers array from the Map
        const answers = [];
        if (session.answers) {
            session.answers.forEach((selectedIndices, key) => {
                answers.push({
                    questionIndex: parseInt(key, 10),
                    selectedIndices: selectedIndices
                });
            });
        }

        let score = 0;
        let totalMarks = 0;

        quiz.questions.forEach((question, index) => {
            totalMarks += question.marks;

            const studentAnswer = answers.find(a => a.questionIndex === index);
            const selectedIndices = studentAnswer ? studentAnswer.selectedIndices : [];

            const correctIndices = [...question.correctIndices].sort();
            const selectedSorted = [...selectedIndices].sort();
            
            const isCorrect =
                selectedSorted.length === correctIndices.length &&
                selectedSorted.every((val, idx) => val === correctIndices[idx]);

            if (isCorrect) {
                score += question.marks;
            }
        });

        // Time calculations
        const maxTimeTaken = quiz.duration * 60;
        let timeTaken = maxTimeTaken - session.timeLeft;
        timeTaken = timeTaken > 0 ? timeTaken : null;

        // Ensure we don't accidentally create duplicates if one already exists
        let result = await Result.findOne({
            studentId: session.studentId,
            quizId: quiz._id
        });

        if (result) {
            result.score = score;
            result.totalMarks = totalMarks;
            result.answers = answers;
            if (timeTaken != null) result.timeTaken = timeTaken;
            result.submittedAt = new Date();
            await result.save();
        } else {
            result = new Result({
                studentId: session.studentId,
                quizId: quiz._id,
                score,
                totalMarks,
                answers,
                timeTaken: timeTaken ?? null
            });
            await result.save();
        }

        // Update streaks
        const student = await User.findById(session.studentId);
        if (student) {
            await student.updateStreak();
        }

        // Clear the session
        await QuizSession.findByIdAndDelete(session._id);
        console.log(`Auto-submitted expired quiz ${quiz._id} for student ${session.studentId}`);
    } catch (error) {
        console.error(`Error processing auto-submission for session ${session._id}:`, error);
    }
};

// Scheduler Initialization
const initScheduler = () => {
    // Top-of-year task
    cron.schedule('0 0 1 7 *', () => {
        promoteAllStudents();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
    console.log('Academic Rollover Scheduler Initialized (Runs on July 1st)');

    // Run every 2 minutes to check for auto-submissions
    cron.schedule('*/2 * * * *', () => {
        autoSubmitExpiredQuizzes();
    });
    console.log('Auto-submit Scheduler Initialized (Runs every 2 minutes)');
};

module.exports = { initScheduler, promoteAllStudents, autoSubmitExpiredQuizzes };

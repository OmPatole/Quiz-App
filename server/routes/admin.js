const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const sanitize = require('mongo-sanitize');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const User = require('../models/User');
const Chapter = require('../models/Chapter');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const bcrypt = require('bcryptjs');

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const csvFileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();
    const allowedMimes = ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'text/plain'];

    if (ext === '.csv' || allowedMimes.includes(mime)) {
        return cb(null, true);
    }

    cb(new Error('Only CSV files are allowed'));
};

const uploadCsv = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: csvFileFilter
});
const uploadJson = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

// @route   POST /api/admin/upload-students
// @desc    Upload CSV file and create student accounts
// @access  Admin only
router.post('/upload-students', auth, roleAuth('Admin'), (req, res, next) => {
    uploadCsv.single('file')(req, res, (err) => {
        if (!err) return next();

        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'CSV file is too large. Max size is 10 MB.' });
            }

            return res.status(400).json({ message: `Upload failed: ${err.message}` });
        }

        return res.status(400).json({ message: err.message || 'Invalid CSV upload request' });
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Please upload a CSV file using multipart/form-data with field name "file"'
            });
        }

        const students = [];
        const errors = [];

        // Valid enum values that EXACTLY match the User model
        const VALID_ACADEMIC_YEARS = ['First Year', 'Second Year', 'Third Year', 'Last Year', 'Graduated'];
        const VALID_BRANCHES = ['CST', 'E&TC', 'Mechanical', 'Food', 'Chemical'];

        // Parse CSV file
        fs.createReadStream(req.file.path)
            .pipe(csv({
                mapHeaders: ({ header }) => (header || '').replace(/^\uFEFF/, '').trim().toLowerCase().replace(/\s+/g, '')
            }))
            .on('data', (row) => {
                // Expecting columns: Name, PRN, DOB, Academic Year, Branch, Batch Year
                const name = (row.name || '').trim();
                const prn = (row.prn || '').trim();
                const dob = (row.dob || '').trim();

                if (!name || !prn || !dob) {
                    errors.push(`Row skipped (Missing Name, PRN, or DOB): ${JSON.stringify(row)}`);
                    return;
                }

                // --- Password Generation: Initials + @ + DOB digits ---
                const nameParts = name.split(' ').filter(p => p.length > 0);
                let initials = 'XX';
                if (nameParts.length >= 2) {
                    initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
                } else if (nameParts.length === 1) {
                    initials = nameParts[0][0].toUpperCase();
                }
                // Strip all non-digits so both DD-MM-YYYY and YYYY-MM-DD are handled
                const cleanDob = dob.replace(/\D/g, '');
                const generatedPassword = `${initials}@${cleanDob}`;

                // --- Validate & normalise enum fields ---
                const rawAcademicYear = (row.academicyear || '').trim();
                const rawBranch = (row.branch || '').trim();
                const rawBatchYear = (row.batchyear || '').trim();

                const academicYear = VALID_ACADEMIC_YEARS.includes(rawAcademicYear) ? rawAcademicYear : undefined;
                const branch = VALID_BRANCHES.includes(rawBranch) ? rawBranch : undefined;

                if (rawAcademicYear && !academicYear) {
                    errors.push(`Warning – PRN ${prn}: Academic Year "${rawAcademicYear}" is not a valid value. Allowed: ${VALID_ACADEMIC_YEARS.join(', ')}. Field left blank.`);
                }
                if (rawBranch && !branch) {
                    errors.push(`Warning – PRN ${prn}: Branch "${rawBranch}" is not a valid value. Allowed: ${VALID_BRANCHES.join(', ')}. Field left blank.`);
                }

                students.push({
                    name,
                    prn,
                    password: generatedPassword,
                    academicYear,   // undefined when invalid → Mongoose skips the field
                    branch,         // undefined when invalid → Mongoose skips the field
                    batchYear: rawBatchYear || undefined,
                    role: 'Student'
                });
            })
            .on('end', async () => {
                try {
                    if (students.length === 0) {
                        try { fs.unlinkSync(req.file.path); } catch (_) { }
                        return res.status(400).json({
                            message: 'No valid rows found in CSV',
                            created: 0,
                            errors: errors.length,
                            details: { createdStudents: [], errors }
                        });
                    }

                    // Fetch existing PRNs to detect duplicates
                    const existingStudents = await User.find({ prn: { $in: students.map(s => s.prn) } }).select('prn');
                    const existingPrns = new Set(existingStudents.map(s => s.prn));

                    const studentsToCreate = [];
                    students.forEach(s => {
                        if (existingPrns.has(s.prn)) {
                            errors.push(`Skipped – PRN ${s.prn} (${s.name}) already exists in the database`);
                        } else {
                            studentsToCreate.push(s);
                        }
                    });

                    // Bulk create
                    let createdCount = 0;
                    if (studentsToCreate.length > 0) {
                        try {
                            const salt = await bcrypt.genSalt(10);
                            for (let s of studentsToCreate) {
                                s.password = await bcrypt.hash(s.password, salt);
                            }
                            const results = await User.insertMany(studentsToCreate, { ordered: false });
                            createdCount = results.length;
                        } catch (err) {
                            // BulkWriteError: some docs may have been inserted, others failed
                            if (err.name === 'MongoBulkWriteError' || err.writeErrors) {
                                createdCount = err.result?.nInserted || 0;
                                (err.writeErrors || []).forEach(we => {
                                    const doc = studentsToCreate[we.index];
                                    errors.push(`DB Error – PRN ${doc?.prn || 'unknown'}: ${we.errmsg || we.err?.errmsg || 'Write error'}`);
                                });
                            } else {
                                console.error('Insert Error:', err);
                                errors.push(`Database error: ${err.message}`);
                            }
                        }
                    }

                    // Clean up temp file
                    try { fs.unlinkSync(req.file.path); } catch (_) { }

                    res.json({
                        message: 'Student upload completed',
                        created: createdCount,
                        errors: errors.length,
                        details: {
                            createdStudents: studentsToCreate.slice(0, createdCount).map(s => ({ name: s.name, prn: s.prn })),
                            errors
                        }
                    });
                } catch (error) {
                    console.error(error);
                    try { fs.unlinkSync(req.file.path); } catch (_) { }
                    res.status(500).json({ message: 'Error processing students' });
                }
            })
            .on('error', (err) => {
                console.error('CSV parse error:', err);
                try { fs.unlinkSync(req.file.path); } catch (_) { }
                res.status(400).json({ message: 'Failed to parse CSV file: ' + err.message });
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// @route   GET /api/admin/students
// @desc    Get all students with filters
// @access  Admin only
router.get('/students', auth, roleAuth('Admin'), async (req, res) => {
    try {
        const academicYear = sanitize(req.query.academicYear);
        const branch = sanitize(req.query.branch);
        const batchYear = sanitize(req.query.batchYear);

        let query = { role: 'Student' };

        if (academicYear && typeof academicYear === 'string') query.academicYear = academicYear;
        if (branch && typeof branch === 'string') query.branch = branch;
        if (batchYear && typeof batchYear === 'string') query.batchYear = batchYear;

        const students = await User.find(query).select('-password');
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/admin/create-chapter
// @desc    Create a new chapter
// @access  Admin only
router.post('/create-chapter', auth, roleAuth('Admin'), async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Chapter title is required' });
        }

        const chapter = new Chapter({ title });
        await chapter.save();

        res.status(201).json({
            message: 'Chapter created successfully',
            chapter
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/admin/upload-quiz-json
// @desc    Upload JSON file containing quizzes for a chapter
// @access  Admin only
router.post('/upload-quiz-json', auth, roleAuth('Admin'), uploadJson.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a JSON file' });
        }

        const { chapterId } = req.body;

        if (!chapterId) {
            return res.status(400).json({ message: 'Chapter ID is required' });
        }

        // Verify chapter exists
        const chapter = await Chapter.findById(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }

        // Read and parse JSON from in-memory upload
        const fileContent = req.file.buffer.toString('utf8');
        const quizData = JSON.parse(fileContent);

        if (!Array.isArray(quizData)) {
            return res.status(400).json({ message: 'JSON file must contain an array of quizzes' });
        }

        // Prepare quizzes with chapter reference and separate questions
        const quizzesToCreate = [];
        for (const quiz of quizData) {
            let questionIds = [];
            if (quiz.questions && Array.isArray(quiz.questions)) {
                for (const q of quiz.questions) {
                    if (q._id && q._id.toString().length === 24) {
                        questionIds.push(q._id);
                    } else {
                        const newQ = new Question(q);
                        await newQ.save();
                        questionIds.push(newQ._id);
                    }
                }
            }
            quizzesToCreate.push({
                ...quiz,
                questions: questionIds,
                chapter: chapterId
            });
        }

        // Bulk insert quizzes
        const results = await Quiz.insertMany(quizzesToCreate);
        const createdQuizzes = results.map(q => q._id);

        // Update chapter with quiz references atomically
        await Chapter.findByIdAndUpdate(chapterId, {
            $push: { quizzes: { $each: createdQuizzes } }
        });

        res.status(201).json({
            message: 'Quizzes uploaded successfully',
            count: createdQuizzes.length,
            chapter: await Chapter.findById(chapterId).populate({
                path: 'quizzes',
                populate: { path: 'questions' }
            })
        });
    } catch (error) {
        console.error(error);
        if (error instanceof SyntaxError) {
            return res.status(400).json({ message: 'Invalid JSON file' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/chapters
// @desc    Get all chapters with quizzes
// @access  Admin only
router.get('/chapters', auth, roleAuth('Admin'), async (req, res) => {
    try {
        const chapters = await Chapter.find().populate({
            path: 'quizzes',
            populate: { path: 'questions' }
        });
        res.json(chapters);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/chapters/:id
// @desc    Delete a chapter
// @access  Admin only
router.delete('/chapters/:id', auth, roleAuth('Admin'), async (req, res) => {
    try {
        const chapter = await Chapter.findById(req.params.id);
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }

        // Optional: Cascade delete quizzes
        // await Quiz.deleteMany({ chapter: chapter._id });

        await chapter.deleteOne();
        res.json({ message: 'Chapter deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/quiz/:id
// @desc    Update a quiz
// @access  Admin only
router.put('/quiz/:id', auth, roleAuth('Admin'), async (req, res) => {
    try {
        let questionIds = [];
        if (req.body.questions) {
            for (const q of req.body.questions) {
                if (q._id && q._id.toString().length === 24) {
                    await Question.findByIdAndUpdate(q._id, q);
                    questionIds.push(q._id);
                } else {
                    const newQ = new Question(q);
                    await newQ.save();
                    questionIds.push(newQ._id);
                }
            }
            req.body.questions = questionIds;
        }

        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('questions');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        res.json({
            message: 'Quiz updated successfully',
            quiz
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/quiz/:id
// @desc    Delete a quiz
// @access  Admin only
router.delete('/quiz/:id', auth, roleAuth('Admin'), async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Remove quiz reference from chapter
        await Chapter.findByIdAndUpdate(
            quiz.chapter,
            { $pull: { quizzes: quiz._id } }
        );

        await quiz.deleteOne();

        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/admin/create-quiz
// @desc    Create a new quiz manually
// @access  Admin only
router.post('/create-quiz', auth, roleAuth('Admin'), async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            quizType,
            duration,
            scheduledAt,
            questions,
            chapter
        } = req.body;

        // Basic validation
        if (!title || !questions || questions.length === 0) {
            return res.status(400).json({ message: 'Title and at least one question are required' });
        }

        let questionIds = [];
        for (const q of questions) {
            if (q._id && q._id.toString().length === 24) {
                // Reuse existing question
                questionIds.push(q._id);
            } else {
                // Create new question
                const newQ = new Question(q);
                await newQ.save();
                questionIds.push(newQ._id);
            }
        }

        const quiz = new Quiz({
            title,
            description,
            category,
            quizType,
            duration,
            scheduledAt,
            questions: questionIds,
            chapter: chapter || undefined
        });

        await quiz.save();

        // If chapter is provided, update chapter
        if (chapter) {
            const chapterDoc = await Chapter.findById(chapter);
            if (chapterDoc) {
                chapterDoc.quizzes.push(quiz._id);
                await chapterDoc.save();
            }
        }

        const populatedQuiz = await Quiz.findById(quiz._id).populate('questions');

        res.status(201).json({
            message: 'Quiz created successfully',
            quiz: populatedQuiz
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/student-stats/:studentId
// @desc    Get detailed stats for a student
// @access  Admin or Student (Own data)
router.get('/student-stats/:studentId', auth, async (req, res) => {
    try {
        const { studentId } = req.params;

        // Authorization check: Admin can view all, Student can only view their own
        if (req.user.role !== 'Admin' && req.user._id.toString() !== studentId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const mongoose = require('mongoose');
        const Result = require('../models/Result');
        const User = require('../models/User');

        const student = await User.findById(studentId).select('-password');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Fetch user results
        const results = await Result.find({ studentId }).populate('quizId', 'title category duration');

        // 5. Calculate Effective Streak
        let currentStreak = student.currentStreak || 0;
        const lastDate = student.lastQuizDate ? new Date(student.lastQuizDate) : null;

        if (lastDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const last = new Date(lastDate);
            last.setHours(0, 0, 0, 0);

            const diffTime = Math.abs(today - last);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // If gap > 1 day, streak is broken (0). 
            // If gap == 1 (yesterday) or 0 (today), streak is valid.
            if (diffDays > 1) {
                currentStreak = 0;
            }
        } else {
            currentStreak = 0;
        }

        // Calculate stats from results
        const totalTests = results.length;
        const totalScore = results.reduce((acc, r) => acc + (r.score || 0), 0);
        const totalMax = results.reduce((acc, r) => acc + (r.totalMarks || 0), 0);
        const avgScore = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

        // Calculate accuracy (correct answers / total questions attempted)
        // Approximate accuracy using score percentage for now
        const accuracy = avgScore;

        // 6. Completed Quizzes List
        const completedQuizIds = results.map(r => r.quizId?._id);

        // Batch rank is based on average score within the same batchYear cohort.
        let batchRank = null;
        let batchSize = 0;

        if (student.batchYear) {
            const batchStudents = await User.find({
                role: 'Student',
                batchYear: student.batchYear
            }).select('_id createdAt');

            batchSize = batchStudents.length;

            if (batchStudents.length > 0) {
                const batchStudentIds = batchStudents.map(entry => entry._id);
                const batchResults = await Result.aggregate([
                    { $match: { studentId: { $in: batchStudentIds } } },
                    {
                        $group: {
                            _id: '$studentId',
                            totalScore: { $sum: '$score' },
                            totalMarks: { $sum: '$totalMarks' },
                            totalTests: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            totalScore: 1,
                            totalMarks: 1,
                            totalTests: 1,
                            avgScore: {
                                $cond: [
                                    { $gt: ['$totalMarks', 0] },
                                    { $round: [{ $multiply: [{ $divide: ['$totalScore', '$totalMarks'] }, 100] }, 2] },
                                    0
                                ]
                            }
                        }
                    }
                ]);

                const batchResultMap = new Map(batchResults.map(entry => [entry._id.toString(), entry]));
                const rankedBatch = batchStudents
                    .map(studentEntry => {
                        const stats = batchResultMap.get(studentEntry._id.toString()) || {};

                        return {
                            studentId: studentEntry._id.toString(),
                            createdAt: studentEntry.createdAt ? new Date(studentEntry.createdAt).getTime() : 0,
                            avgScore: stats.avgScore || 0,
                            totalTests: stats.totalTests || 0,
                            totalScore: stats.totalScore || 0
                        };
                    })
                    .sort((a, b) => {
                        if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
                        if (b.totalTests !== a.totalTests) return b.totalTests - a.totalTests;
                        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
                        return a.createdAt - b.createdAt;
                    });

                const myBatchEntry = rankedBatch.find(entry => entry.studentId === student._id.toString());
                batchRank = myBatchEntry ? rankedBatch.findIndex(entry => entry.studentId === student._id.toString()) + 1 : null;
            }
        }

        // Activity Map (Last 365 days)
        const activityMap = {};
        results.forEach(r => {
            const date = new Date(r.submittedAt).toISOString().split('T')[0];
            activityMap[date] = (activityMap[date] || 0) + 1;
        });

        // Recent Activity
        const recentActivity = results.slice(0, 5).map(r => ({
            _id: r._id,
            quizTitle: r.quizId?.title || 'Unknown Quiz',
            score: r.score,
            totalMarks: r.totalMarks,
            date: r.submittedAt
        }));

        res.json({
            student: {
                ...student.toObject(),
                currentStreak // Return calculated/verified streak
            },
            stats: {
                totalTests,
                avgScore,
                accuracy,
                batchRank,
                batchSize
            },
            activityMap,
            recentActivity,
            completedQuizIds
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/reports/monthly
// @desc    Generate monthly report
// @access  Admin only
router.get('/reports/monthly', auth, roleAuth('Admin'), async (req, res) => {
    try {
        const { month } = req.query; // YYYY-MM
        if (!month) {
            return res.status(400).json({ message: 'Month is required (YYYY-MM)' });
        }

        const year = parseInt(month.split('-')[0]);
        const monthIndex = parseInt(month.split('-')[1]) - 1; // 0-indexed

        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59); // Last day of month

        const Result = require('../models/Result');
        const Quiz = require('../models/Quiz');

        // 1. Fetch Results for the month
        const results = await Result.find({
            submittedAt: { $gte: startDate, $lte: endDate }
        }).populate('quizId', 'title category');

        // 2. Aggregate Data
        const totalQuizzesTaken = results.length;
        const uniqueStudents = new Set(results.map(r => r.studentId.toString())).size;

        const totalScore = results.reduce((acc, r) => acc + (r.score || 0), 0);
        const totalMax = results.reduce((acc, r) => acc + (r.totalMarks || 0), 0);
        const averageScore = totalQuizzesTaken > 0 ? Math.round((totalScore / totalMax) * 100) : 0; // Percentage

        // 3. Weekly Breakdown
        const weeklyBreakdown = {};
        results.forEach(r => {
            const date = new Date(r.submittedAt);
            // Simple week calculation: Day of month / 7
            const weekNum = Math.ceil(date.getDate() / 7);
            const weekKey = `Week ${weekNum}`;
            weeklyBreakdown[weekKey] = (weeklyBreakdown[weekKey] || 0) + 1;
        });

        // 4. Quiz Metadata (Active quizzes)
        const activeQuizIds = [...new Set(results.map(r => r.quizId?._id.toString()))];
        // Also include quizzes created in this month
        const createdQuizzes = await Quiz.find({
            createdAt: { $gte: startDate, $lte: endDate }
        });
        const createdQuizIds = createdQuizzes.map(q => q._id.toString());

        const allRelevantQuizIds = [...new Set([...activeQuizIds, ...createdQuizIds])];

        const quizMetadata = await Promise.all(allRelevantQuizIds.map(async (qId) => {
            const quiz = await Quiz.findById(qId).select('title category');
            if (!quiz) return null;

            // Calc avg for this quiz in this month
            const quizResults = results.filter(r => r.quizId?._id.toString() === qId);
            let quizAvg = 0;
            if (quizResults.length > 0) {
                const qs = quizResults.reduce((a, r) => a + r.score, 0);
                const qt = quizResults.reduce((a, r) => a + r.totalMarks, 0);
                quizAvg = qt > 0 ? Math.round((qs / qt) * 100) : 0;
            }

            return {
                _id: quiz._id,
                title: quiz.title,
                category: quiz.category,
                attempts: quizResults.length,
                averageScore: quizAvg
            };
        }));

        res.json({
            month,
            totalQuizzesTaken,
            uniqueStudents,
            averageScore,
            weeklyBreakdown,
            quizMetadata: quizMetadata.filter(q => q !== null)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/questions/bank
// @desc    Get all unique questions from question bank (excluding weekly quizzes)
// @access  Admin only
router.get('/questions/bank', auth, roleAuth('Admin'), async (req, res) => {
    try {
        const Quiz = require('../models/Quiz');
        const quizzes = await Quiz.find({ quizType: { $ne: 'weekly' } }).populate('questions');

        const allQuestions = [];
        const seenQuestions = new Set();

        quizzes.forEach(quiz => {
            if (quiz.questions) {
                quiz.questions.forEach(q => {
                    // Use question text as unique key
                    const qKey = q.text.trim().toLowerCase();
                    if (!seenQuestions.has(qKey)) {
                        seenQuestions.add(qKey);
                        allQuestions.push({
                            _id: q._id, // Real Question ID
                            questionText: q.text,
                            options: q.options,
                            correctIndices: q.correctIndices,
                            explanation: q.explanation,
                            marks: q.marks,
                            fromQuiz: quiz.title
                        });
                    }
                });
            }
        });

        res.json(allQuestions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/analytics
// @desc    Get aggregated analytics based on filters
// @access  Admin only
router.get('/analytics', auth, roleAuth('Admin'), async (req, res) => {
    try {
        const academicYear = sanitize(req.query.academicYear);
        const branch = sanitize(req.query.branch);
        const batchYear = sanitize(req.query.batchYear);

        const Result = require('../models/Result');

        // 1. Filter Students
        let userQuery = { role: 'Student' };
        if (academicYear && typeof academicYear === 'string') userQuery.academicYear = academicYear;
        if (branch && typeof branch === 'string') userQuery.branch = branch;
        if (batchYear && typeof batchYear === 'string') userQuery.batchYear = batchYear;

        const students = await User.find(userQuery).select('_id name');
        const studentIds = students.map(s => s._id);

        if (studentIds.length === 0) {
            return res.json({
                activityTrends: [],
                categoryPerformance: [],
                passFailRatio: [],
                leaderboard: []
            });
        }

        // 2. Activity Trends (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activityTrends = await Result.aggregate([
            {
                $match: {
                    studentId: { $in: studentIds },
                    submittedAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 3. Category Performance (Avg Score %)
        const categoryPerformance = await Result.aggregate([
            { $match: { studentId: { $in: studentIds } } },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: 'quizId',
                    foreignField: '_id',
                    as: 'quiz'
                }
            },
            { $unwind: '$quiz' },
            {
                $group: {
                    _id: '$quiz.category',
                    avgScore: {
                        $avg: {
                            $cond: [
                                { $eq: ['$totalMarks', 0] },
                                0,
                                { $multiply: [{ $divide: ['$score', '$totalMarks'] }, 100] }
                            ]
                        }
                    }
                }
            },
            { $match: { _id: { $ne: '' } } } // Exclude empty categories
        ]);

        // 4. Pass/Fail Ratio (35% pass threshold)
        const passFailRatio = await Result.aggregate([
            { $match: { studentId: { $in: studentIds } } },
            {
                $group: {
                    _id: {
                        $cond: [{ $gte: ['$score', { $multiply: ['$totalMarks', 0.35] }] }, 'Pass', 'Fail']
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        // 5. Leaderboard (Top 5 Students by Avg Score %)
        const leaderboard = await Result.aggregate([
            { $match: { studentId: { $in: studentIds } } },
            {
                $group: {
                    _id: '$studentId',
                    avgScore: {
                        $avg: {
                            $cond: [
                                { $eq: ['$totalMarks', 0] },
                                0,
                                { $multiply: [{ $divide: ['$score', '$totalMarks'] }, 100] }
                            ]
                        }
                    }
                }
            },
            { $sort: { avgScore: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
            {
                $project: {
                    name: '$student.name',
                    avgScore: { $round: ['$avgScore', 1] }
                }
            }
        ]);

        res.json({
            activityTrends,
            categoryPerformance: categoryPerformance.map(c => ({ category: c._id, avgScore: Math.round(c.avgScore) })),
            passFailRatio,
            leaderboard
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// @route   DELETE /api/admin/students/delete-bulk
// @desc    Bulk delete students by academic year or batch year
// @access  Admin only
router.delete('/students/delete-bulk', auth, roleAuth('Admin'), async (req, res) => {
    try {
        const academicYear = sanitize(req.body.academicYear);
        const batchYear = sanitize(req.body.batchYear);

        const Result = require('../models/Result');
        const QuizSession = require('../models/QuizSession');

        if (!academicYear && !batchYear) {
            return res.status(400).json({ message: 'Academic Year or Batch Year is required' });
        }

        let query = { role: 'Student' };
        if (academicYear && typeof academicYear === 'string') query.academicYear = academicYear;
        if (batchYear && typeof batchYear === 'string') query.batchYear = batchYear;

        // 1. Find students to delete
        const studentsToDelete = await User.find(query).select('_id');
        const studentIds = studentsToDelete.map(s => s._id);

        if (studentIds.length === 0) {
            return res.status(404).json({ message: 'No students found matching criteria' });
        }

        // 2. Delete Results
        await Result.deleteMany({ studentId: { $in: studentIds } });

        // 3. Delete QuizSessions
        await QuizSession.deleteMany({ studentId: { $in: studentIds } });

        // 4. Delete Users
        const deleteResult = await User.deleteMany({ _id: { $in: studentIds } });

        res.json({
            message: 'Bulk deletion successful',
            deletedCount: deleteResult.deletedCount
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/admin/promote-students
// @desc    Manually trigger student promotion
// @access  Admin only
router.post('/promote-students', auth, roleAuth('Admin'), async (req, res) => {
    try {
        const { promoteAllStudents } = require('../utils/scheduler');
        const result = await promoteAllStudents();

        if (result.success) {
            res.json({ message: 'Promotion successful', count: result.count });
        } else {
            res.status(500).json({ message: 'Promotion failed', error: result.error });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/students/:id
// @desc    Delete a single student
// @access  Admin only
router.delete('/students/:id', auth, roleAuth('Admin'), async (req, res) => {
    try {
        const studentId = req.params.id;
        const Result = require('../models/Result');
        const QuizSession = require('../models/QuizSession');

        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Delete associated results
        await Result.deleteMany({ studentId });

        // Delete associated quiz sessions
        await QuizSession.deleteMany({ studentId });

        // Delete user
        await student.deleteOne();

        res.json({ message: 'Student account deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/materials/:id
// @desc    Delete study material
// @access  Admin only
router.delete('/materials/:id', auth, roleAuth('Admin'), async (req, res) => {
    try {
        const Material = require('../models/Material');
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Check if fileUrl exists and delete file
        if (material.type === 'pdf' && material.fileUrl) {
            // Assume fileUrl is relative from root or uploads folder
            const filePath = path.join(__dirname, '..', material.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await material.deleteOne();

        res.json({ message: 'Material deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/reports/monthly-performance
// @desc    Generate detailed monthly attendance and performance report for Weekly/Test quizzes
// @access  Admin only
router.get('/reports/monthly-performance', auth, roleAuth('Admin'), async (req, res) => {
    try {
        const { month } = req.query; // YYYY-MM
        if (!month) {
            return res.status(400).json({ message: 'Month is required (YYYY-MM)' });
        }

        const year = parseInt(month.split('-')[0]);
        const monthIndex = parseInt(month.split('-')[1]) - 1; // 0-indexed

        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

        const Result = require('../models/Result');
        const User = require('../models/User');

        // 1. Find Results for the month, populating Quiz to filter by type
        const results = await Result.find({
            submittedAt: { $gte: startDate, $lte: endDate }
        }).populate({
            path: 'quizId',
            select: 'title quizType'
        }).populate('studentId', 'name prn branch academicYear batchYear');

        // 2. Aggregate Data by Student
        const studentStats = {};

        results.forEach(result => {
            // Skip if quiz mismatch (due to populate match filtering) or no student
            if (!result.quizId || !result.studentId) return;

            const student = result.studentId;
            const sId = student._id.toString();

            if (!studentStats[sId]) {
                studentStats[sId] = {
                    studentDetails: {
                        name: student.name,
                        prn: student.prn,
                        branch: student.branch,
                        academicYear: student.academicYear,
                        batchYear: student.batchYear
                    },
                    uniqueQuizzes: new Set(),
                    totalPercentage: 0,
                    attemptCount: 0
                };
            }

            // Track unique quiz
            studentStats[sId].uniqueQuizzes.add(result.quizId._id.toString());

            // Calculate percentage for this result
            const percentage = result.totalMarks > 0 ? (result.score / result.totalMarks) * 100 : 0;
            studentStats[sId].totalPercentage += percentage;
            studentStats[sId].attemptCount += 1;
        });

        // 3. Format Response
        const reportData = Object.values(studentStats).map(stat => {
            const avgScore = stat.attemptCount > 0
                ? Math.round(stat.totalPercentage / stat.attemptCount)
                : 0;

            return {
                ...stat.studentDetails,
                quizzesAttended: stat.uniqueQuizzes.size,
                avgScore
            };
        });

        res.json(reportData);

    } catch (error) {
        console.error("Monthly Performance Report Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

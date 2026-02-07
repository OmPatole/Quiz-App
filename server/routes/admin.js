const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const User = require('../models/User');
const Chapter = require('../models/Chapter');
const Quiz = require('../models/Quiz');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// @route   POST /api/admin/upload-students
// @desc    Upload CSV file and create student accounts
// @access  Admin only
router.post('/upload-students', auth, roleAuth('Admin'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file' });
        }

        const students = [];
        const errors = [];

        // Parse CSV file
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                // Expecting columns: Name, PRN, DOB, Academic Year, Branch, Batch Year
                const name = row.Name || row.name;
                const prn = row.PRN || row.prn;
                const dob = row.DOB || row.dob; // Expecting DD-MM-YYYY

                if (name && prn && dob) {
                    const trimmedName = name.trim();
                    const trimmedPrn = prn.trim();
                    const trimmedDob = dob.trim();

                    // Generate Password: Initials + @ + DOB (DDMMYYYY)
                    // 1. Initials
                    const nameParts = trimmedName.split(' ').filter(part => part.length > 0);
                    let initials = '';
                    if (nameParts.length >= 2) {
                        initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
                    } else if (nameParts.length === 1) {
                        initials = nameParts[0][0].toUpperCase();
                    } else {
                        initials = 'XX'; // Fallback
                    }

                    // 2. Format DOB (Remove separators)
                    const cleanDob = trimmedDob.replace(/[-/]/g, '');

                    const generatedPassword = `${initials}@${cleanDob}`;

                    students.push({
                        name: trimmedName,
                        prn: trimmedPrn,
                        password: generatedPassword,
                        academicYear: (row['Academic Year'] || row.academicYear || '').trim(),
                        branch: (row.Branch || row.branch || '').trim(),
                        batchYear: (row['Batch Year'] || row.batchYear || '').trim(),
                        role: 'Student'
                    });
                } else {
                    errors.push(`Invalid row (Missing Name, PRN, or DOB): ${JSON.stringify(row)}`);
                }
            })
            .on('end', async () => {
                try {
                    // Bulk create students
                    const createdStudents = [];
                    for (const studentData of students) {
                        try {
                            // Check if student already exists
                            const existingStudent = await User.findOne({ prn: studentData.prn });
                            if (existingStudent) {
                                errors.push(`Student with PRN ${studentData.prn} already exists`);
                                continue;
                            }

                            const student = new User(studentData);
                            await student.save();
                            createdStudents.push({
                                name: student.name,
                                prn: student.prn
                            });
                        } catch (err) {
                            errors.push(`Error creating student ${studentData.prn}: ${err.message}`);
                        }
                    }

                    // Delete uploaded file
                    fs.unlinkSync(req.file.path);

                    res.json({
                        message: 'Student upload completed',
                        created: createdStudents.length,
                        errors: errors.length,
                        details: {
                            createdStudents,
                            errors
                        }
                    });
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ message: 'Error processing students' });
                }
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
        const { academicYear, branch, batchYear } = req.query;
        let query = { role: 'Student' };

        if (academicYear) query.academicYear = academicYear;
        if (branch) query.branch = branch;
        if (batchYear) query.batchYear = batchYear;

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
router.post('/upload-quiz-json', auth, roleAuth('Admin'), upload.single('file'), async (req, res) => {
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

        // Read and parse JSON file
        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        const quizData = JSON.parse(fileContent);

        if (!Array.isArray(quizData)) {
            return res.status(400).json({ message: 'JSON file must contain an array of quizzes' });
        }

        // Create quizzes and link to chapter
        const createdQuizzes = [];
        for (const quiz of quizData) {
            const newQuiz = new Quiz({
                ...quiz,
                chapter: chapterId
            });
            await newQuiz.save();
            createdQuizzes.push(newQuiz._id);
        }

        // Update chapter with quiz references atomically
        await Chapter.findByIdAndUpdate(chapterId, {
            $push: { quizzes: { $each: createdQuizzes } }
        });

        // Delete uploaded file
        fs.unlinkSync(req.file.path);

        res.status(201).json({
            message: 'Quizzes uploaded successfully',
            count: createdQuizzes.length,
            chapter: await Chapter.findById(chapterId).populate('quizzes')
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
        const chapters = await Chapter.find().populate('quizzes');
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
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

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

        const quiz = new Quiz({
            title,
            description,
            category,
            quizType,
            duration,
            scheduledAt,
            questions,
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

        res.status(201).json({
            message: 'Quiz created successfully',
            quiz
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

        const student = await User.findById(studentId).select('name prn branch');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // 1. Fetch all results for this student
        const results = await Result.find({ studentId }).populate('quizId', 'title').sort({ submittedAt: -1 });

        // 2. Calculate Stats
        const totalTests = results.length;
        const totalScore = results.reduce((acc, r) => acc + r.score, 0);
        const totalMaxMarks = results.reduce((acc, r) => acc + r.totalMarks, 0);

        const avgScore = totalTests > 0 ? Math.round(totalScore / totalTests) : 0;
        const accuracy = totalMaxMarks > 0 ? Math.round((totalScore / totalMaxMarks) * 100) : 0;

        // 3. Activity Map (YYYY-MM-DD -> Count)
        const activityMap = {};
        results.forEach(r => {
            const dateStr = new Date(r.submittedAt).toISOString().split('T')[0];
            activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
        });

        // 4. Recent Activity
        const recentActivity = results.slice(0, 5).map(r => ({
            quizId: r.quizId?._id,
            quizTitle: r.quizId?.title || 'Deleted Quiz',
            score: r.score,
            submittedAt: r.submittedAt
        }));

        res.json({
            student,
            stats: {
                totalTests,
                avgScore,
                accuracy
            },
            activityMap,
            recentActivity
        });

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
        const { academicYear, branch, batchYear } = req.query;
        const Result = require('../models/Result');

        // 1. Filter Students
        let userQuery = { role: 'Student' };
        if (academicYear) userQuery.academicYear = academicYear;
        if (branch) userQuery.branch = branch;
        if (batchYear) userQuery.batchYear = batchYear;

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

        // 4. Pass/Fail Ratio
        const passFailStats = await Result.aggregate([
            { $match: { studentId: { $in: studentIds } } },
            {
                $project: {
                    isPassed: { $gte: ['$score', { $multiply: ['$totalMarks', 0.4] }] } // Assuming 40% passing for now, user requested 50% split logic in prompt
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $gte: ['$score', { $multiply: ['$totalMarks', 0.5] }] }, // wait, project above matches prompt
                            'Pass',
                            'Fail'
                        ]
                    }, // Let's simplify logic: User asked for >50%.
                    // Actually let's just group by the boolean logic requested
                    status: {
                        $push: {
                            $cond: [{ $gte: ['$score', { $multiply: ['$totalMarks', 0.5] }] }, 'Pass', 'Fail']
                        }
                    }
                }
            }
        ]);

        // Re-doing Pass/Fail to be cleaner
        const passFailRatio = await Result.aggregate([
            { $match: { studentId: { $in: studentIds } } },
            {
                $group: {
                    _id: {
                        $cond: [{ $gte: ['$score', { $multiply: ['$totalMarks', 0.5] }] }, 'Pass', 'Fail']
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
        const { academicYear, batchYear } = req.body;
        const Result = require('../models/Result');
        const QuizSession = require('../models/QuizSession');

        if (!academicYear && !batchYear) {
            return res.status(400).json({ message: 'Academic Year or Batch Year is required' });
        }

        let query = { role: 'Student' };
        if (academicYear) query.academicYear = academicYear;
        if (batchYear) query.batchYear = batchYear;

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

module.exports = router;

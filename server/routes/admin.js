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
                // Expecting columns: Name, PRN, Password, Academic Year, Branch, Batch Year
                if (row.Name && row.PRN && row.Password) {
                    students.push({
                        name: row.Name.trim(),
                        prn: row.PRN.trim(),
                        password: row.Password.trim(),
                        academicYear: row['Academic Year'] ? row['Academic Year'].trim() : undefined,
                        branch: row.Branch ? row.Branch.trim() : undefined,
                        batchYear: row['Batch Year'] ? row['Batch Year'].trim() : undefined,
                        role: 'Student'
                    });
                } else {
                    // Try lower case keys as fallback or just log error
                    // For now, adhere to strict requirement but allow lowercase keys if user made mistake
                    const name = row.Name || row.name;
                    const prn = row.PRN || row.prn || row.PRN;
                    const password = row.Password || row.password;

                    if (name && prn && password) {
                        students.push({
                            name: name.trim(),
                            prn: prn.trim(),
                            password: password.trim(),
                            academicYear: (row['Academic Year'] || row.academicYear || '').trim(),
                            branch: (row.Branch || row.branch || '').trim(),
                            batchYear: (row['Batch Year'] || row.batchYear || '').trim(),
                            role: 'Student'
                        });
                    } else {
                        errors.push(`Invalid row: ${JSON.stringify(row)}`);
                    }
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

        // Update chapter with quiz references
        chapter.quizzes.push(...createdQuizzes);
        await chapter.save();

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

module.exports = router;

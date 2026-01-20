const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
});

const StudentSchema = new mongoose.Schema({
  name: String,
  prn: { type: String, required: true, unique: true },
  year: String,
  joinedAt: { type: Date, default: Date.now }
});

const QuizSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // Keeping string ID for backward compatibility
  title: String,
  schedule: { start: Date, end: Date },
  questions: Array, // Storing questions structure as mixed array
  createdBy: String,
  targetYears: [String],
  category: { type: String, default: 'aptitude' },
  quizType: { type: String, default: 'weekly' },
  duration: Number
});

const ResultSchema = new mongoose.Schema({
  quizId: String,
  prn: String,
  studentName: String,
  year: String,
  score: Number,
  totalMarks: Number,
  status: String,
  submittedAt: { type: Date, default: Date.now }
});

const MaterialSchema = new mongoose.Schema({
  id: String,
  title: String,
  type: String,
  parentId: String,
  fileUrl: String,
  createdBy: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  Admin: mongoose.model('Admin', AdminSchema),
  Student: mongoose.model('Student', StudentSchema),
  Quiz: mongoose.model('Quiz', QuizSchema),
  Result: mongoose.model('Result', ResultSchema),
  Material: mongoose.model('Material', MaterialSchema)
};
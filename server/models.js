const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }, // 'superadmin' or 'admin'
  scope: { type: String, default: 'all' },  // 'all', 'aptitude', 'coding'
  createdAt: { type: Date, default: Date.now }
});

const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true },
  category: { type: String, required: true }, // 'aptitude' or 'coding'
  studentCount: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now }
});

const studentSchema = new mongoose.Schema({
  name: String,
  prn: { type: String, required: true },
  year: String,
  branch: String,
  category: { type: String, required: true }, // Locks student to category
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentBatch' }
});
// Allow same PRN only if in different categories
studentSchema.index({ prn: 1, category: 1 }, { unique: true });

const quizSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  title: String,
  description: String,
  questions: Array,
  category: String, // 'aptitude' or 'coding'
  quizType: String, // 'weekly' or 'mock'
  duration: Number,
  schedule: { start: String, end: String },
  targetYears: Array,
  createdBy: String,
  createdAt: { type: Date, default: Date.now }
});

const resultSchema = new mongoose.Schema({
  quizId: String,
  prn: String,
  studentName: String,
  year: String,
  branch: String,
  score: Number,
  totalMarks: Number,
  status: String,
  submittedAt: { type: Date, default: Date.now }
});

const materialSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    title: String,
    type: String, 
    parentId: { type: String, default: null },
    url: String, 
    createdBy: String,
    createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);
const Student = mongoose.model('Student', studentSchema);
const Quiz = mongoose.model('Quiz', quizSchema);
const Result = mongoose.model('Result', resultSchema);
const Material = mongoose.model('Material', materialSchema);
const StudentBatch = mongoose.model('StudentBatch', batchSchema);

module.exports = { Admin, Student, Quiz, Result, Material, StudentBatch };
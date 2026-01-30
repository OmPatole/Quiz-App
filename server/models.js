const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }, 
  scope: { type: String, default: 'all' },
  createdAt: { type: Date, default: Date.now }
});

const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true }, // e.g., "Class of 2026"
  studentCount: { type: Number, default: 0 },
  type: { type: String, default: 'official' }, 
  uploadedAt: { type: Date, default: Date.now }
});

const studentSchema = new mongoose.Schema({
  name: String,
  prn: { type: String, required: true, unique: true }, 
  year: String, // "First Year", "Second Year" (Academic Year)
  branch: String,
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentBatch' },
  
  // Registration Info
  registrationType: { type: String, default: 'admin-upload' }, 
  gradYear: { type: String }, // e.g., "2026" (Crucial for your filter)
  
  // Stats
  lastLogin: { type: Date }, 
  createdAt: { type: Date, default: Date.now }
});

const quizSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  title: String,
  description: String,
  questions: Array,
  quizType: String,
  duration: Number,
  schedule: { start: String, end: String },
  targetYears: Array,
  category: String,
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

const Material = mongoose.model('Material', new mongoose.Schema({
    id: { type: String, unique: true },
    title: String,
    type: String, 
    parentId: { type: String, default: null },
    url: String, 
    createdBy: String,
    createdAt: { type: Date, default: Date.now }
}));

const Admin = mongoose.model('Admin', adminSchema);
const Student = mongoose.model('Student', studentSchema);
const Quiz = mongoose.model('Quiz', quizSchema);
const Result = mongoose.model('Result', resultSchema);
const StudentBatch = mongoose.model('StudentBatch', batchSchema);

module.exports = { Admin, Student, Quiz, Result, Material, StudentBatch };
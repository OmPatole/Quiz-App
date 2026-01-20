require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const hpp = require('hpp');
const { Admin } = require('./models');
const bcrypt = require('bcryptjs');

// Route Imports
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const quizRoutes = require('./routes/quiz');
const utilRoutes = require('./routes/utils');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quiz_app_db';

// Database
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Init Root Admin
const initAdmin = async () => {
  try {
    const hash = await bcrypt.hash(process.env.ADMIN_PASS || 'admin123', 10);
    await Admin.findOneAndUpdate(
      { username: process.env.ADMIN_USER || 'admin' }, 
      { $set: { password: hash, role: 'superadmin', scope: 'all' } },
      { upsert: true, new: true } 
    );
  } catch (e) { console.error("Admin Init Error:", e); }
};
initAdmin();

// Middleware
app.use(express.json({ limit: '50mb' })); 
app.use(hpp()); 
app.use(cors({ origin: '*' })); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api', adminRoutes);
app.use('/api', quizRoutes);
app.use('/api', utilRoutes);

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
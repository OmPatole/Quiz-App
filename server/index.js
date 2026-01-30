const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const adminRoutes = require('./routes/admin'); 

const app = express();
// Default to 5000 if not specified, matching frontend expectation
const PORT = process.env.PORT || 5000; 
const MONGO_URI = 'mongodb://localhost:27017/quiz_app_db'; 

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api', quizRoutes);
app.use('/api', adminRoutes);

// Database Connection
mongoose.connect(MONGO_URI)
.then(() => {
    console.log('✅ MongoDB Connected');
    // Start Server only after DB connects
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
})
.catch(err => console.error('❌ MongoDB Connection Error:', err));
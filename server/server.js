require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const chapterRoutes = require('./routes/chapters');
const quizRoutes = require('./routes/quiz');
const materialRoutes = require('./routes/material');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/uploads', express.static('uploads')); // Serve uploaded files
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/material', materialRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

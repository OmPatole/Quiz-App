require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const sessionRoutes = require('./routes/auth'); // Renamed from auth to session for Brave compatibility
const adminRoutes = require('./routes/admin');
const chapterRoutes = require('./routes/chapters');
const quizRoutes = require('./routes/quiz');
const materialRoutes = require('./routes/material');

const app = express();

// Connect to MongoDB
connectDB();

// Initialize Scheduler
const { initScheduler } = require('./utils/scheduler');
initScheduler();

// Initialize Admin User (runs once on startup)
const { initializeAdmin } = require('./utils/initAdmin');
// Wait a bit for DB connection to be fully established
setTimeout(() => {
    initializeAdmin();
}, 1000);

// Middleware
app.use(cors({
    origin: '*', // Allow mobile devices to connect
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add security headers to prevent Brave Shields blocking
app.use((req, res, next) => {
    // These headers tell Brave this is a legitimate educational app, not a tracker
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'interest-cohort=()'); // Disable FLoC
    next();
});

// Routes
app.use('/uploads', express.static('uploads')); // Serve uploaded files
app.use('/api/session', sessionRoutes); // Changed from /auth to /session for Brave compatibility
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Network: http://172.16.128.89:${PORT}`);
});

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envCandidates = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '..', '.env')
];

for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        break;
    }
}
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
const uploadsDir = path.join(__dirname, 'uploads');
const clientDistDir = path.join(__dirname, '..', 'client', 'dist');
const clientIndexPath = path.join(clientDistDir, 'index.html');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const cleanStaleTempUploads = () => {
    try {
        const files = fs.readdirSync(uploadsDir);
        const tempFilePattern = /^\d+-.*\.(csv|json)$/i;

        for (const fileName of files) {
            if (!tempFilePattern.test(fileName)) continue;

            const filePath = path.join(uploadsDir, fileName);
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.warn(`Could not delete temp upload file ${fileName}: ${err.message}`);
            }
        }
    } catch (err) {
        console.warn(`Temp upload cleanup skipped: ${err.message}`);
    }
};

cleanStaleTempUploads();

const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    console.error('Set them in server/.env (or project root .env) and restart the service.');
    process.exit(1);
}

const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser clients (e.g., curl, mobile apps without Origin header)
        if (!origin) {
            return callback(null, true);
        }

        // Always allow local development origins.
        if (
            origin.startsWith('http://localhost') ||
            origin.startsWith('http://127.0.0.1')
        ) {
            return callback(null, true);
        }

        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.warn(`CORS blocked for origin: ${origin}`);
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

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
app.use(cors(corsOptions));
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
app.use('/uploads', express.static(uploadsDir)); // Serve uploaded files
app.use('/api/session', sessionRoutes); // Changed from /auth to /session for Brave compatibility
app.use('/api/admin', adminRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/material', materialRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Serve frontend build in production-like deployments where client/dist exists.
// Keep API and upload routes separate and never rewrite asset/module requests to HTML.
if (fs.existsSync(clientDistDir) && fs.existsSync(clientIndexPath)) {
    app.use(express.static(clientDistDir, { index: false }));

    app.get(/.*/, (req, res, next) => {
        const reqPath = req.path || '';
        const isApiOrUploads = reqPath.startsWith('/api') || reqPath.startsWith('/uploads');
        const hasFileExtension = path.extname(reqPath) !== '';

        if (isApiOrUploads || hasFileExtension) {
            return next();
        }

        return res.sendFile(clientIndexPath);
    });
} else {
    console.warn(`Frontend build not found at ${clientDistDir}. Serve client/dist in production to avoid asset MIME issues.`);
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Helper function to get network IP
const getNetworkIP = () => {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
};

app.listen(PORT, '0.0.0.0', () => {
    const networkIP = getNetworkIP();
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Network: http://${networkIP}:${PORT}`);
});

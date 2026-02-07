# Quiz Application - MERN Stack

A production-ready quiz application built with MongoDB, Express, React, and Node.js featuring role-based authentication, chapter-based quiz organization, and automatic scoring.

## 🚀 Features

### Admin Features
- **Student Management**: Bulk upload student credentials via CSV with filtering and search
- **Chapter Management**: Create and organize quizzes by chapters
- **Quiz Management**: Upload quiz JSON files or create quizzes manually
- **Analytics Dashboard**: Track student performance and quiz statistics
- **Materials Management**: Upload and manage study materials

### Student Features
- **Chapter-based Navigation**: Browse quizzes organized by chapters
- **Quiz Taking**: Full-screen quiz interface with countdown timer
- **Automatic Scoring**: Instant results based on correct answers
- **Detailed Results**: View explanations for each question
- **Study Materials**: Access uploaded learning resources

## 🛠️ Tech Stack

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Multer for file uploads
- CSV Parser

### Frontend
- React 18 with Vite
- React Router v6
- Tailwind CSS (Dark Mode)
- Axios
- React Dropzone
- Lucide React Icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)

## ⚡ Quick Start

### 1. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install
```

### 2. Configure Environment Variables

**server/.env:**
```env
MONGODB_URI=mongodb://localhost:27017/quiz-app
JWT_SECRET=your_secure_jwt_secret_key
PORT=5000
```

**client/.env:**
```env
# For local development
VITE_API_URL=http://localhost:5000/api

# For mobile/network testing (replace with your IP)
# VITE_API_URL=http://192.168.1.15:5000/api
```

### 3. Start MongoDB

Make sure MongoDB is running:
```bash
# Windows
net start MongoDB

# Or use MongoDB Compass
```

### 4. Create Admin User

```bash
cd server
node createAdmin.js
```

This creates an admin account:
- Email: `admin@quiz.com`
- Password: `admin123`

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

**Access the app:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📱 Local Network Development (Mobile Testing)

To access the app from your phone on the same network:

### 1. Find Your Local IP
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.15`)

### 2. Update client/.env
```env
VITE_API_URL=http://192.168.1.15:5000/api
```

### 3. Start Servers
The frontend is configured to run on port 80 and listen on all network interfaces.

**Note:** On Windows, you may need to run the terminal as Administrator to use port 80. If port 80 doesn't work, change `port: 80` to `port: 3000` in `client/vite.config.js`.

### 4. Access from Phone
Open browser on your phone and navigate to:
```
http://192.168.1.15
```

## 📁 Project Structure

```
Quiz-App/
├── server/
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth & role-based access
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Helper functions
│   ├── uploads/         # File storage
│   └── server.js        # Entry point
│
└── client/
    ├── src/
    │   ├── api/         # Axios configuration
    │   ├── components/  # React components
    │   │   ├── admin/   # Admin-specific components
    │   │   ├── layout/  # Navbar, Footer
    │   │   └── student/ # Student-specific components
    │   ├── context/     # Auth context
    │   ├── pages/       # Route pages
    │   ├── App.jsx      # Main app component
    │   └── index.css    # Global styles
    └── vite.config.js   # Vite configuration
```

## 🎯 Usage Guide

### Admin Workflow

1. **Login** with admin credentials
2. **Upload Students** via CSV:
   ```csv
   name,email,password
   John Doe,john@example.com,password123
   Jane Smith,jane@example.com,password456
   ```
3. **Create Chapters** (e.g., "Chain Rule", "Probability")
4. **Upload Quizzes** via JSON or create manually
5. **Monitor Analytics** on the dashboard

### Student Workflow

1. **Login** with credentials provided by admin
2. **Browse Chapters** on the dashboard
3. **Select a Quiz** from a chapter
4. **Take the Quiz** with timer
5. **View Results** with explanations

## 📊 Quiz JSON Format

```json
[
  {
    "title": "Quiz Set 1",
    "description": "Practice questions on Chain Rule",
    "quizType": "practice",
    "duration": 30,
    "category": "Calculus",
    "questions": [
      {
        "text": "What is the derivative of sin(x)?",
        "marks": 5,
        "options": [
          { "text": "cos(x)" },
          { "text": "-cos(x)" },
          { "text": "sin(x)" },
          { "text": "-sin(x)" }
        ],
        "correctIndices": [0],
        "explanation": "The derivative of sin(x) is cos(x)"
      }
    ]
  }
]
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin/Student)
- Protected API routes
- CORS configuration for network access

## 🎨 Design Features

- **Dark Mode**: Solid dark theme with emerald green accents
- **Mobile Responsive**: Optimized for all screen sizes
- **Hamburger Menu**: Collapsible navigation on mobile
- **Sticky Navigation**: Easy quiz navigation on mobile
- **Horizontal Scroll Tables**: Mobile-friendly data tables

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `server/.env`

### Port Already in Use
- Change PORT in `server/.env`
- Update VITE_API_URL in `client/.env` accordingly

### CORS Errors
- Ensure both server and client are running
- Verify API URL matches server port

### Port 80 Access Denied
- Run terminal as Administrator (Windows)
- Or change to port 3000 in `client/vite.config.js`

### Firewall Blocking Network Access
- Allow ports 80 and 5000 in Windows Firewall
- Ensure devices are on the same network

## 📝 Default Credentials

**Admin:**
- Email: `admin@quiz.com`
- Password: `admin123`

**Sample Students (from CSV):**
- `john@example.com` / `student123`
- `jane@example.com` / `student456`

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Admin Routes
- `POST /api/admin/upload-students` - Upload CSV
- `POST /api/admin/create-chapter` - Create chapter
- `POST /api/admin/upload-quiz-json` - Upload quiz
- `GET /api/admin/chapters` - Get all chapters
- `PUT /api/admin/quiz/:id` - Update quiz
- `DELETE /api/admin/quiz/:id` - Delete quiz

### Student Routes
- `GET /api/chapters` - Get all chapters
- `GET /api/chapters/:id` - Get chapter details
- `GET /api/quiz/:id` - Get quiz
- `POST /api/quiz/submit` - Submit answers
- `GET /api/quiz/results/:quizId` - Get result
- `GET /api/quiz/my-results` - Get all results

## 📄 License

MIT

---

**Made by students, for students** 🎓

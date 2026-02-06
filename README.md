# MERN Quiz Application

A production-ready quiz application built with the MERN stack (MongoDB, Express, React, Node.js) featuring role-based authentication, chapter-based quiz organization, and automatic scoring.

## Features

### Admin Features
- **Student Management**: Bulk upload student credentials via CSV
- **Chapter Management**: Create and organize quizzes by chapters
- **Quiz Management**: Upload quiz JSON files or create quizzes manually
- **CRUD Operations**: Edit and delete quizzes

### Student Features
- **Chapter-based Navigation**: Browse quizzes organized by chapters
- **Quiz Taking**: Full-screen quiz interface with countdown timer
- **Automatic Scoring**: Instant results based on correct answers
- **Detailed Results**: View explanations for each question

## Tech Stack

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
- Tailwind CSS
- Axios
- React Dropzone
- Lucide React Icons

## Project Structure

```
Quiz-App/
├── server/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roleAuth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Chapter.js
│   │   ├── Quiz.js
│   │   └── Result.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── chapters.js
│   │   └── quiz.js
│   ├── uploads/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── client/
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── admin/
    │   │   │   ├── StudentManager.jsx
    │   │   │   └── QuizManager.jsx
    │   │   ├── common/
    │   │   │   └── ProtectedRoute.jsx
    │   │   └── student/
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── StudentDashboard.jsx
    │   │   ├── QuizTaking.jsx
    │   │   └── QuizResult.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
cd c:\Projects\Quiz-App
```

### 2. Setup Server
```bash
cd server
npm install
```

Create `.env` file in server directory:
```env
MONGODB_URI=mongodb://localhost:27017/quiz-app
JWT_SECRET=your_secure_jwt_secret_key
PORT=5000
```

### 3. Setup Client
```bash
cd ../client
npm install
```

Create `.env` file in client directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB
Make sure MongoDB is running on your system.

### 5. Run the Application

**Terminal 1 - Start Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Client:**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Usage

### Creating an Admin User
Since students are created via CSV upload, you need to manually create an admin user in MongoDB:

```javascript
// Connect to MongoDB and run:
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash
  role: "Admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use this Node.js script:
```javascript
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/quiz-app');

const User = require('./models/User');

async function createAdmin() {
  const admin = new User({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123', // Will be hashed automatically
    role: 'Admin'
  });
  await admin.save();
  console.log('Admin created');
  process.exit();
}

createAdmin();
```

### CSV Format for Students
```csv
name,email,password
John Doe,john@example.com,password123
Jane Smith,jane@example.com,password456
```

### Quiz JSON Format
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

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user

### Admin Routes
- `POST /api/admin/upload-students` - Upload CSV with student credentials
- `POST /api/admin/create-chapter` - Create a new chapter
- `POST /api/admin/upload-quiz-json` - Upload quiz JSON file
- `GET /api/admin/chapters` - Get all chapters with quizzes
- `PUT /api/admin/quiz/:id` - Update a quiz
- `DELETE /api/admin/quiz/:id` - Delete a quiz

### Student Routes
- `GET /api/chapters` - Get all chapters
- `GET /api/chapters/:id` - Get chapter with quizzes
- `GET /api/quiz/:id` - Get quiz for taking
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/results/:quizId` - Get result for a quiz
- `GET /api/quiz/my-results` - Get all results for student

## Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Automatic token refresh

## License
MIT

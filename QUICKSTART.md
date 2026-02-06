# Quick Start Guide

## Prerequisites
- Node.js installed
- MongoDB installed and running

## Step 1: Install Dependencies

### Server
```bash
cd server
npm install
```

### Client
```bash
cd client
npm install
```

## Step 2: Configure Environment Variables

The `.env` files are already created. Update if needed:

**server/.env:**
```env
MONGODB_URI=mongodb://localhost:27017/quiz-app
JWT_SECRET=your_secure_jwt_secret_key
PORT=5000
```

**client/.env:**
```env
VITE_API_URL=http://localhost:5000/api
```

## Step 3: Start MongoDB

Make sure MongoDB is running:
```bash
# Windows
net start MongoDB

# Or if using MongoDB Compass, just open it
```

## Step 4: Create Admin User

```bash
cd server
node createAdmin.js
```

This will create an admin user with:
- Email: `admin@quiz.com`
- Password: `admin123`

## Step 5: Start the Application

Open two terminal windows:

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

## Step 6: Access the Application

Open your browser and go to: **http://localhost:5173**

## Step 7: Login as Admin

1. Use the credentials:
   - Email: `admin@quiz.com`
   - Password: `admin123`

2. You'll be redirected to the Admin Dashboard

## Step 8: Upload Students

1. Go to "Student Management" tab
2. Drag and drop `sample-students.csv` (located in project root)
3. Wait for the upload to complete

## Step 9: Create a Chapter and Upload Quiz

1. Go to "Quiz Management" tab
2. Create a new chapter (e.g., "Chain Rule")
3. Select the chapter from dropdown
4. Drag and drop `sample-quiz.json` (located in project root)
5. Wait for the upload to complete

## Step 10: Test as Student

1. Logout from admin
2. Login with a student account:
   - Email: `john@example.com`
   - Password: `student123`
3. Browse chapters and take a quiz!

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check the connection string in `server/.env`

### Port Already in Use
- Change the PORT in `server/.env`
- Update VITE_API_URL in `client/.env` accordingly

### CORS Errors
- Make sure both server and client are running
- Check that the API URL in client/.env matches the server port

## Default Ports
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MongoDB: mongodb://localhost:27017

## Sample Credentials

**Admin:**
- Email: admin@quiz.com
- Password: admin123

**Students (from sample CSV):**
- john@example.com / student123
- jane@example.com / student456
- alice@example.com / student789
- bob@example.com / student101

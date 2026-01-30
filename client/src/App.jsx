import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- Public / Student Components ---
import Home from './components/Home';
import StudentLogin from './components/StudentLogin';
import StudentDashboard from './components/StudentDashboard'; 
import StudentProfile from './components/StudentProfile'; // This is the STUDENT'S view
import QuizPlayer from './components/QuizPlayer';
import LeaderboardList from './components/LeaderboardList';
import Leaderboard from './components/Leaderboard';
import StudyMaterials from './components/StudyMaterials';

// --- Admin Components ---
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
// IMPORT FIXED: Import the Admin-side profile with a unique name
import AdminStudentProfile from './components/admin/students/StudentProfile'; 

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing admin session
  useEffect(() => {
    const session = localStorage.getItem('admin_session') || sessionStorage.getItem('admin_session');
    if (session) setIsAuth(true);
    setLoading(false);
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Home />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/study" element={<StudyMaterials />} />
        
        {/* --- Quiz Routes --- */}
        <Route path="/quiz/:quizId" element={<QuizPlayer />} />
        <Route path="/leaderboards" element={<LeaderboardList />} />
        <Route path="/leaderboard/:quizId" element={<Leaderboard />} />

        {/* --- Admin Routes --- */}
        <Route path="/login" element={!isAuth ? <AdminLogin setIsAuth={setIsAuth} /> : <Navigate to="/admin" replace />} />
        
        {/* FIX 1: Add '/*' so AdminPanel can handle its own sub-routes (like /admin/students) */}
        <Route 
          path="/admin/*" 
          element={isAuth ? <AdminPanel setIsAuth={setIsAuth} /> : <Navigate to="/login" replace />} 
        />
        
        {/* FIX 2: Register the Admin Student Profile Route */}
        <Route 
          path="/admin/student-profile" 
          element={isAuth ? <AdminStudentProfile /> : <Navigate to="/login" replace />} 
        />
        
      </Routes>
    </Router>
  );
}

export default App;
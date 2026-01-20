import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import StudentLogin from './components/StudentLogin';
import StudentDashboard from './components/StudentDashboard'; 
import QuizPlayer from './components/QuizPlayer';
import LeaderboardList from './components/LeaderboardList';
import Leaderboard from './components/Leaderboard';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import StudyMaterials from './components/StudyMaterials';

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('admin_session') || sessionStorage.getItem('admin_session');
    if (session) setIsAuth(true);
    setLoading(false);
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/study" element={<StudyMaterials />} />
        <Route path="/quiz/:quizId" element={<QuizPlayer />} />
        <Route path="/leaderboards" element={<LeaderboardList />} />
        <Route path="/leaderboard/:quizId" element={<Leaderboard />} />
        <Route path="/login" element={!isAuth ? <AdminLogin setIsAuth={setIsAuth} /> : <Navigate to="/admin" replace />} />
        <Route path="/admin" element={isAuth ? <AdminPanel setIsAuth={setIsAuth} /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
export default App;
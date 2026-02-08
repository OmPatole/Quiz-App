import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import QuizTaking from './pages/QuizTaking';
import QuizResult from './pages/QuizResult';
import ChapterDetails from './pages/ChapterDetails';
import Features from './pages/Features';
import AboutUs from './pages/AboutUs';
import TermsOfService from './pages/TermsOfService';
import DataSafety from './pages/DataSafety';
import CookieUsage from './pages/CookieUsage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/data-safety" element={<DataSafety />} />
            <Route path="/cookie-usage" element={<CookieUsage />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/chapter/:chapterId"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <ChapterDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/quiz/:quizId"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <QuizTaking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/result"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <QuizResult />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

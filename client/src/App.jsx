import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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

import ScrollToTop from './components/common/ScrollToTop';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/data-safety" element={<DataSafety />} />
              <Route path="/cookie-usage" element={<CookieUsage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

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
    </ThemeProvider>
  );
}

export default App;

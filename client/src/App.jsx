import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';

// Lazy load components
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const QuizTaking = lazy(() => import('./pages/QuizTaking'));
const QuizResult = lazy(() => import('./pages/QuizResult'));
const ChapterDetails = lazy(() => import('./pages/ChapterDetails'));
const Features = lazy(() => import('./pages/Features'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const DataSafety = lazy(() => import('./pages/DataSafety'));
const CookieUsage = lazy(() => import('./pages/CookieUsage'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <ScrollToTop />
            <Suspense fallback={<LoadingFallback />}>
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
            </Suspense>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

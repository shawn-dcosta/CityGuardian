import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import ToastContainer, { type ToastItem } from './components/ToastContainer';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import ReportingPage from './pages/ReportingPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTheme } from './hooks/useTheme';

// REPLACE WITH YOUR ACTUAL GOOGLE CLIENT ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

// Root Route Wrapper to handle "Landing vs Dashboard" logic
const RootRoute: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null; // Or a spinner

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
};

function App() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastItem['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-deep-charcoal-900 dark:via-deep-charcoal-800 dark:to-deep-charcoal-900 transition-colors duration-300">
            <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

            <Routes>
              {/* Root: Landing Page (or Redirect) */}
              <Route path="/" element={<RootRoute />} />

              {/* Public Auth Pages */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* User Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={['public', 'admin']}>
                    <UserDashboard isDarkMode={isDarkMode} />
                  </ProtectedRoute>
                }
              />

              {/* Reporting Page */}
              <Route
                path="/report"
                element={
                  <ProtectedRoute roles={['public', 'admin']}>
                    <ReportingPage
                      isDarkMode={isDarkMode}
                      toasts={toasts}
                      addToast={addToast}
                    />
                  </ProtectedRoute>
                }
              />

              {/* Admin Dashboard */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <Dashboard isDarkMode={isDarkMode} />
                  </ProtectedRoute>
                }
              />
            </Routes>

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Footer */}
            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
            >
              <p>
                Powered by <span className="font-semibold text-electric-blue-600 dark:text-electric-blue-400">Gemini AI</span> • Built with React & Tailwind CSS
              </p>
            </motion.footer>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

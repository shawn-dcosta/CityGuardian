import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import ReportingForm from './components/ReportingForm';
import LocationMap from './components/LocationMap';
import ImpactHistory from './components/ImpactHistory';
import ToastContainer, { type ToastItem } from './components/ToastContainer';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { useGeolocation } from './hooks/useGeolocation';
import { useTheme } from './hooks/useTheme';

// REPLACE WITH YOUR ACTUAL GOOGLE CLIENT ID
// REPLACE WITH YOUR ACTUAL GOOGLE CLIENT ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

interface HomePageProps {
  isDarkMode: boolean;
  location: {
    latitude: number | null;
    longitude: number | null;
    address: string;
    loading: boolean;
    error: string | null;
  };
  toasts: ToastItem[];
  removeToast: (id: string) => void;
  addToast: (message: string, type?: ToastItem['type']) => void;
  historyRefresh: number;
  handleReportSubmitted: () => void;
}

// Home Page Component
const HomePage: React.FC<HomePageProps> = ({ isDarkMode, location, addToast, historyRefresh, handleReportSubmitted }) => {
  return (
    <div className="container mx-auto px-4 pb-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Hero Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-electric-blue-600 to-electric-blue-800 dark:from-electric-blue-400 dark:to-electric-blue-600 bg-clip-text text-transparent">
            AI Civic Action Platform
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Report civic issues with AI-powered vision recognition
          </p>
        </motion.div>

        {/* Reporting Form */}
        <ReportingForm
          location={location}
          addToast={addToast}
          onReportSubmitted={handleReportSubmitted}
        />

        {/* Location Map */}
        <LocationMap location={location} isDarkMode={isDarkMode} />

        {/* Impact History */}
        <ImpactHistory refreshTrigger={historyRefresh} />
      </motion.div>
    </div>
  );
};

function App() {
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useGeolocation();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const addToast = (message: string, type: ToastItem['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleReportSubmitted = () => {
    setHistoryRefresh(prev => prev + 1);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-deep-charcoal-900 dark:via-deep-charcoal-800 dark:to-deep-charcoal-900 transition-colors duration-300">
            <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    isDarkMode={isDarkMode}
                    location={location}
                    toasts={toasts}
                    removeToast={removeToast}
                    addToast={addToast}
                    historyRefresh={historyRefresh}
                    handleReportSubmitted={handleReportSubmitted}
                  />
                }
              />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                path="/dashboard"
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

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
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
import { Mail, Instagram, Twitter, Linkedin, Github, Phone } from 'lucide-react';

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
          <div className="min-h-screen pb-24 md:pb-0 bg-city-surface-light dark:bg-city-black text-city-black dark:text-city-white transition-colors duration-300 overflow-x-hidden relative w-full flex flex-col">
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

            {/* PWA Mobile Navigation */}
            <BottomNav />

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Premium Light Tactical Footer */}
            <motion.footer
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-auto border-t-2 border-city-blue bg-gray-100 py-8 px-6 relative overflow-hidden"
            >
              {/* Tactical Technical Grid Texture - Reverted as preferred */}
              <div 
                className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:40px_40px] pointer-events-none" 
              />

              <div className="container mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                  {/* Brand Block */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="font-heading text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-1">
                         CityGuardian
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="h-1 w-1 bg-city-blue rounded-full" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                          Watching Over Urban Spaces
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 max-w-xs font-medium leading-relaxed">
                      Next-generation urban monitoring & response system. Empowering citizens through AI-driven civic maintenance.
                    </p>
                  </div>

                  {/* Contact & Socials Block */}
                  <div className="flex flex-col gap-8 md:min-w-[300px]">
                    {/* Section: Contact */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Contact Us</h3>
                      <div className="flex flex-col gap-2">
                        <a 
                          href="mailto:feedback.cityguardian@gmail.com" 
                          className="group flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white border border-gray-200 hover:border-city-blue transition-all duration-300"
                        >
                          <Mail className="w-3.5 h-3.5 text-city-blue" />
                          <span className="text-sm font-bold text-gray-700">feedback.cityguardian@gmail.com</span>
                        </a>
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white border border-gray-200">
                          <Phone className="w-3.5 h-3.5 text-city-blue" />
                          <span className="text-sm font-bold text-gray-700">8097719862</span>
                        </div>
                      </div>
                    </div>

                    {/* Subtle Break Line */}
                    <div className="h-px w-full bg-gray-300 opacity-50" />

                    {/* Section: Socials */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Socials</h3>
                      <div className="flex items-center gap-6">
                        <Instagram className="w-5 h-5 text-gray-400 hover:text-city-blue transition-colors cursor-pointer" />
                        {/* Custom X (Twitter) Icon */}
                        <div className="text-gray-400 hover:text-city-blue transition-colors cursor-pointer">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </div>
                        <Linkedin className="w-5 h-5 text-gray-400 hover:text-city-blue transition-colors cursor-pointer" />
                        <Github className="w-5 h-5 text-gray-400 hover:text-city-blue transition-colors cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="text-lg leading-none">©</span> {new Date().getFullYear()} CityGuardian. All Rights Reserved.
                  </p>
                </div>
              </div>
            </motion.footer>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

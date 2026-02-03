import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Sun, AlertCircle, LayoutDashboard, FileText, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDarkMode, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const isDashboard = location.pathname === '/dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-none border-x-0 border-t-0 mb-6 shadow-lg"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/">
            <motion.div
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <AlertCircle className="text-electric-blue-500 w-7 h-7" />
              <span className="text-xl font-bold bg-gradient-to-r from-electric-blue-500 to-electric-blue-700 bg-clip-text text-transparent">
                CityGuardian
              </span>
            </motion.div>
          </Link>

          <div className="flex items-center gap-4">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/report">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${location.pathname === '/report'
                    ? 'bg-electric-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <FileText className="w-4 h-4" />
                  Report Issue
                </motion.button>
              </Link>

              {isAuthenticated && user?.role === 'admin' && (
                <Link to="/admin">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${location.pathname === '/admin'
                      ? 'bg-electric-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Console
                  </motion.button>
                </Link>
              )}

              {isAuthenticated && (
                <Link to="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isDashboard && location.pathname !== '/admin'
                      ? 'bg-electric-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <User className="w-4 h-4" />
                    My Dashboard
                  </motion.button>
                </Link>
              )}

              {isAuthenticated ? (
                <div className="flex items-center gap-3 ml-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4" />
                    <span>{user?.name}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-lg font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </motion.button>
                </div>
              ) : (
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg font-medium bg-white dark:bg-midnight-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-midnight-600 transition-all flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </motion.button>
                </Link>
              )}
            </div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-full glass-input focus-ring"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-electric-blue-600" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex flex-col gap-2 mt-4">
          <div className="flex gap-2">
            <Link to="/report" className="flex-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full px-4 py-2 rounded-lg font-medium bg-electric-blue-500 text-white flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Report
              </motion.button>
            </Link>

            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className="flex-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-4 py-2 rounded-lg font-medium bg-gray-100 dark:bg-midnight-800 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
                </motion.button>
              </Link>
            )}
          </div>

          {isAuthenticated ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="w-full px-4 py-2 rounded-lg font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout ({user?.name})
            </motion.button>
          ) : (
            <Link to="/login">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full px-4 py-2 rounded-lg font-medium bg-white dark:bg-midnight-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </motion.button>
            </Link>
          )}

        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;

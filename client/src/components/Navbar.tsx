import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, LayoutDashboard, FileText, LogIn, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const isDashboard = location.pathname === '/dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-full sticky top-4 z-50 px-4 flex justify-center pb-4">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-2xl md:rounded-full w-full max-w-6xl z-50 transition-all duration-300"
      >
        <div className="px-6 py-3">
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
                    className={`px-4 py-2 rounded-full hover:-translate-y-[1px] font-medium transition-all flex items-center gap-2 ${location.pathname === '/report'
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
                      className={`px-4 py-2 rounded-full hover:-translate-y-[1px] font-medium transition-all flex items-center gap-2 ${location.pathname === '/admin'
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
                      className={`px-4 py-2 rounded-full hover:-translate-y-[1px] font-medium transition-all flex items-center gap-2 ${isDashboard && location.pathname !== '/admin'
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
                      className="px-3 py-2 rounded-full hover:-translate-y-[1px] font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
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
                      className="px-4 py-2 rounded-full hover:-translate-y-[1px] font-medium bg-white dark:bg-midnight-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-midnight-600 transition-all flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </motion.button>
                  </Link>
                )}
              </div>


              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-full hover:-translate-y-[1px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-midnight-800 transition-colors focus-ring"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden"
              >
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex gap-2">
                    <Link to="/report" className="flex-1" onClick={() => setIsOpen(false)}>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="w-full px-4 py-2 rounded-full hover:-translate-y-[1px] font-medium bg-electric-blue-500 text-white flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Report
                      </motion.button>
                    </Link>

                    {isAuthenticated && user?.role === 'admin' && (
                      <Link to="/admin" className="flex-1" onClick={() => setIsOpen(false)}>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="w-full px-4 py-2 rounded-full hover:-translate-y-[1px] font-medium bg-gray-100 dark:bg-midnight-800 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin
                        </motion.button>
                      </Link>
                    )}
                  </div>

                  {isAuthenticated ? (
                    <>
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="w-full px-4 py-2 rounded-full hover:-translate-y-[1px] font-medium bg-gray-100 dark:bg-midnight-800 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          Dashboard
                        </motion.button>
                      </Link>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setIsOpen(false); handleLogout(); }}
                        className="w-full px-4 py-2 rounded-full hover:-translate-y-[1px] font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout ({user?.name})
                      </motion.button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="w-full px-4 py-2 rounded-full hover:-translate-y-[1px] font-medium bg-white dark:bg-midnight-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </motion.button>
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </div>
  );
};

export default Navbar;

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, LogIn, LogOut, User, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const isDashboard = location.pathname === '/dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-full sticky top-4 z-50 px-4 flex justify-center pb-4 font-sans">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-6xl z-50 rounded-2xl md:rounded-full transition-all duration-300 bg-white/60 dark:bg-city-surface/70 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
      >
        <div className="px-6 py-3 relative overflow-hidden rounded-2xl md:rounded-full">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-city-blue/5 via-transparent to-transparent opacity-50"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <Link to="/">
              <motion.div
                className="flex items-center gap-3 cursor-pointer group"
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-city-blue/30 blur-md rounded-full group-hover:bg-city-blue/50 transition-colors"></div>
                  <Target className="text-city-blue w-7 h-7 relative z-10 group-hover:rotate-90 transition-transform duration-700" />
                </div>
                <span className="text-xl font-heading font-black bg-gradient-to-r from-city-black to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent uppercase tracking-tight">
                  City<span className="text-city-blue">Guardian</span>
                </span>
              </motion.div>
            </Link>

            <div className="flex items-center gap-4">
              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-3">
                {isAuthenticated && (
                  <Link to="/report">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className={`px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all ${location.pathname === '/report'
                        ? 'bg-city-blue text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10'
                        }`}
                    >
                      <FileText className="w-4 h-4" />
                      Report Issue
                    </motion.button>
                  </Link>
                )}

                {isAuthenticated && user?.role === 'admin' && (
                  <Link to="/admin">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className={`px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all ${location.pathname === '/admin'
                        ? 'bg-city-blue text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10'
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
                      whileTap={{ scale: 0.95 }}
                      className={`px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all ${isDashboard && location.pathname !== '/admin'
                        ? 'bg-city-blue text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10'
                        }`}
                    >
                      <User className="w-4 h-4" />
                      Manifest
                    </motion.button>
                  </Link>
                )}

                {isAuthenticated ? (
                  <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10">
                      <div className="w-5 h-5 rounded-full bg-city-blue/20 flex items-center justify-center">
                         <User className="w-3 h-3 text-city-blue" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-city-black dark:text-white">{user?.name}</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="px-4 py-2.5 rounded-full border border-city-red/30 bg-city-red/10 text-city-red hover:bg-city-red hover:text-white transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest group"
                    >
                      <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      Abort
                    </motion.button>
                  </div>
                ) : (
                  <Link to="/login" className="ml-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2.5 rounded-full bg-city-black dark:bg-white text-white dark:text-city-black border border-gray-200 dark:border-white/10 hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                    >
                      <LogIn className="w-4 h-4" />
                      Login
                    </motion.button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.nav>
    </div>
  );
};

export default Navbar;

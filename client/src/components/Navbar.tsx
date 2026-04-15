import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  LogIn,
  LogOut,
  User,
  Target,
  Menu,
  X,
  Home,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isDashboard = location.pathname === '/dashboard';

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Report Issue', path: '/report', icon: FileText, hidden: !isAuthenticated || user?.role === 'admin' },
    { name: 'Dashboard', path: '/dashboard', icon: User, hidden: !isAuthenticated || user?.role === 'admin' },
    { name: 'Admin Console', path: '/admin', icon: LayoutDashboard, hidden: !isAuthenticated || user?.role !== 'admin' },
  ];

  return (
    <div className="w-full sticky top-0 z-50 font-sans">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full z-50 transition-all duration-300 bg-white/80 dark:bg-city-surface/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)]"
      >
        <div className="w-full px-6 md:px-8 py-4 relative overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-city-blue/5 via-transparent to-transparent opacity-50"></div>

          <div className="flex justify-between items-center relative z-10 w-full">
            <div className="flex-shrink-0">
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
            </div>

            {/* Desktop Navigation */}
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-4">
                {navLinks.filter(link => !link.hidden).map((link) => (
                  <Link key={link.path} to={link.path}>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className={`px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all ${location.pathname === link.path || (link.path === '/dashboard' && isDashboard && location.pathname !== '/admin')
                        ? 'bg-city-blue text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10'
                        }`}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.name}
                    </motion.button>
                  </Link>
                ))}
              </div>

              <div className="flex-shrink-0 h-8 w-[1px] bg-gray-200 dark:bg-white/10 mx-2 hidden md:block"></div>

              {/* Desktop Auth Section */}
              <div className="hidden md:block">
                {isAuthenticated ? (
                  <div className="flex items-center gap-4">
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
                      Logout
                    </motion.button>
                  </div>
                ) : (
                  <Link to="/login">
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

              {/* Mobile Menu Trigger */}
              <div className="md:hidden flex items-center">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 shadow-inner"
                >
                  {isMenuOpen ? <X className="w-6 h-6 text-city-blue" /> : <Menu className="w-6 h-6" />}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

      </motion.nav>

      {/* Mobile Sidebar Menu (Drawer) - OUTSIDE the navbar container for total opacity */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Opaque Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/80 z-[100] md:hidden"
            />
            
            {/* Solid Side Panel (Exactly from Top-Right Corner) */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-auto w-[280px] bg-white dark:bg-city-black border-l border-b border-gray-200 dark:border-white/10 z-[101] md:hidden flex flex-col shadow-2xl rounded-bl-3xl overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-8 pb-6 border-b border-gray-100 dark:border-white/5 flex flex-col items-start gap-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 px-3 py-1 bg-city-blue/10 rounded-lg border border-city-blue/30 text-city-blue">
                    <Shield className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Protocol Active</span>
                  </div>
                  <button onClick={() => setIsMenuOpen(false)} className="text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {isAuthenticated && (
                  <div className="flex items-center gap-4 mt-2 mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-city-blue to-blue-600 flex items-center justify-center shadow-lg shadow-city-blue/20">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Authenticated Operative</p>
                      <h3 className="text-lg font-black text-city-black dark:text-white uppercase tracking-tight">{user?.name}</h3>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Body - Focused on Account/Systems */}
              <div className="flex-1" />

              {/* Drawer Footer - Action */}
              <div className="p-8 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                {isAuthenticated ? (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="w-full py-4 rounded-2xl bg-city-red text-white flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-lg shadow-city-red/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </motion.button>
                ) : (
                  <Link to="/login" className="block w-full">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 rounded-2xl bg-city-black dark:bg-white text-white dark:text-city-black flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-lg"
                    >
                      <LogIn className="w-4 h-4" />
                      Login
                    </motion.button>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;

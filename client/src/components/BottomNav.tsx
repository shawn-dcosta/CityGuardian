import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, User, LayoutDashboard, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // We don't want to show the bottom nav on login/register pages
  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  const baseLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Report', path: '/report', icon: FileText },
  ];

  const authLinks = isAuthenticated ? [
    { name: 'Dashboard', path: '/dashboard', icon: User },
    ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin', icon: LayoutDashboard }] : [])
  ] : [
    { name: 'Sign In', path: '/login', icon: LogIn }
  ];

  const allLinks = [...baseLinks, ...authLinks];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-[100] px-4 pb-4 pt-4 bg-gradient-to-t from-white/90 dark:from-city-black/90 to-transparent pointer-events-none">
      <nav className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl w-full pointer-events-auto shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] flex justify-around items-center py-2.5 px-2 relative overflow-hidden">
        {/* Ambient glow inside nav */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-city-blue/10 dark:bg-city-blue/5 blur-[50px] rounded-full pointer-events-none -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none -z-10"></div>
        
        {allLinks.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          
          return (
            <Link key={link.path} to={link.path} className="flex-1 flex flex-col items-center gap-1 group relative z-10">
              <motion.div 
                whileTap={{ scale: 0.9 }}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-city-blue/10 dark:bg-city-blue/20 text-city-blue shadow-inner' 
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-city-black dark:group-hover:text-white group-hover:bg-gray-100 dark:group-hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'fill-current opacity-20' : ''}`} />
                {/* SVG fill to add that native app selected feel */}
                {isActive && (
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className="w-5 h-5 drop-shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                   </div>
                )}
              </motion.div>
              <span className={`text-[9px] font-heading font-black uppercase tracking-[0.15em] transition-colors ${
                isActive ? 'text-city-blue drop-shadow-sm' : 'text-gray-400 dark:text-gray-500 group-hover:text-city-black dark:group-hover:text-white'
              }`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;

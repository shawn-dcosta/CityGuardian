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
    <div className="md:hidden fixed bottom-0 left-0 w-full z-[100] px-4 pb-6 pt-4 bg-gradient-to-t from-white/90 dark:from-[#050505]/95 to-transparent pointer-events-none">
      <nav className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-[2rem] w-full pointer-events-auto shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] flex justify-around items-center py-2 px-1 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-city-blue/10 dark:bg-city-blue/5 blur-[50px] rounded-full pointer-events-none -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none -z-10"></div>

        {allLinks.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;

          return (
            <Link
              key={link.path}
              to={link.path}
              className="flex-1 flex flex-col items-center py-2 group relative tap-highlight-transparent"
            >
              <div className="relative p-2.5 z-10">
                <Icon
                  className={`w-5 h-5 transition-all duration-500 relative z-20 ${isActive
                      ? 'text-city-blue drop-shadow-[0_0_8px_rgba(37,99,235,0.6)] scale-110'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-city-black dark:group-hover:text-white'
                    }`}
                />

                {/* Sliding Pill Highlight */}
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-city-blue/10 dark:bg-city-blue/20 rounded-2xl -z-10 border border-city-blue/20 dark:border-city-blue/30 shadow-inner"
                  />
                )}
              </div>

              <span className={`text-[8px] font-heading font-black uppercase tracking-[0.2em] mt-1 transition-all duration-300 relative z-10 ${isActive
                  ? 'text-city-blue opacity-100 translate-y-0'
                  : 'text-gray-400 dark:text-gray-500 opacity-60'
                }`}>
                {link.name}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <motion.div
                  layoutId="active-dot"
                  className="absolute -bottom-1 w-1 h-1 bg-city-blue rounded-full shadow-[0_0_8px_rgba(37,99,235,0.8)]"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;

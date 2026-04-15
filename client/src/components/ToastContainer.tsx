import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, XCircle, X, ShieldAlert } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-city-green" />,
    error: <XCircle className="w-5 h-5 text-city-red" />,
    warning: <AlertCircle className="w-5 h-5 text-city-orange" />,
    info: <Info className="w-5 h-5 text-city-blue" />
  };

  const borderColors = {
    success: 'border-l-city-green',
    error: 'border-l-city-red',
    warning: 'border-l-city-orange',
    info: 'border-l-city-blue'
  };
  
  const bgColors = {
    success: 'bg-city-green/10',
    error: 'bg-city-red/10',
    warning: 'bg-city-orange/10',
    info: 'bg-city-blue/10'
  };

  const labels = {
    success: 'SYS.SUCCESS',
    error: 'SYS.CRITICAL',
    warning: 'SYS.WARNING',
    info: 'SYS.UPDATE'
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 300, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-2xl p-4 flex items-start gap-4 min-w-[320px] max-w-md border-l-[4px] rounded-r-2xl relative overflow-hidden ${borderColors[type]}`}
    >
      {/* Decorative scanline */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none z-0"></div>
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full pointer-events-none -z-10 translate-x-1/2 -translate-y-1/2 ${bgColors[type]}`}></div>

      <div className="flex-shrink-0 mt-0.5 relative z-10 bg-white dark:bg-[#1a1a1a] p-1.5 rounded-lg border border-gray-100 dark:border-white/5 shadow-inner">
        {icons[type]}
      </div>
      <div className="flex-1 relative z-10 pt-0.5">
        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5 flex-wrap">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{backgroundColor: type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f97316' : '#3b82f6'}}></span>
            {labels[type]}
        </p>
        <p className="text-sm font-heading font-bold text-city-black dark:text-white break-words leading-tight uppercase relative truncate-2-lines">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1.5 rounded-lg border border-gray-200/50 dark:border-white/10 text-gray-400 hover:bg-city-black dark:hover:bg-white hover:text-white dark:hover:text-city-black transition-colors relative z-10 shadow-sm"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 font-sans">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;

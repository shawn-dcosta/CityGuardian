import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number | string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, suffix = '', trend, trendValue, icon: Icon, color = 'blue' }) => {
  const colorMap: Record<string, string> = {
    blue: 'city-blue',
    green: 'city-green',
    red: 'city-red',
    yellow: 'city-orange', // Using our semantic orange instead of yellow
    purple: 'city-black'   // Fallback to black for purple
  };

  const semanticColor = colorMap[color] || 'city-blue';

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-city-surface/80 backdrop-blur-xl relative overflow-hidden group hover:border-${semanticColor}/30 dark:hover:border-${semanticColor}/30 transition-colors shadow-lg shadow-gray-200/20 dark:shadow-none hover:-translate-y-1 font-sans`}
    >
      {/* Background Hover Flare */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${semanticColor}/10 dark:bg-${semanticColor}/20 blur-[30px] rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none`} />

      <div className={`absolute top-0 right-0 p-6 opacity-10 dark:opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-500 text-${semanticColor}`}>
        <Icon className="w-24 h-24" />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-8">
          <div className={`p-2.5 rounded-lg bg-${semanticColor}/10 border border-${semanticColor}/20 text-${semanticColor}`}>
            <Icon className="w-6 h-6" />
          </div>

          {trendValue && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-inner ${trend === 'up' ? 'text-city-green' : trend === 'down' ? 'text-city-red' : 'text-gray-500'}`}>
              {getTrendIcon()}
              <span>{trendValue}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1 relative z-10">
          <p className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase">{title}</p>
          <div className="flex items-baseline gap-2 pb-1">
            <h3 className="font-heading text-6xl font-black text-city-black dark:text-white drop-shadow-sm">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
            {suffix && (
              <span className="text-2xl font-black text-gray-400 dark:text-gray-500">
                {suffix}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;

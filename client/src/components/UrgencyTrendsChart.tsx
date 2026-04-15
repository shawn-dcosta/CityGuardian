import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface UrgencyTrendsChartProps {
  data: {
    categoryBreakdown: Record<string, number>;
    rawData?: any[];
    total: number;
  };
}

const UrgencyTrendsChart: React.FC<UrgencyTrendsChartProps> = ({ data }) => {
  const categories = Object.keys(data.categoryBreakdown);

  // Calculate matrix data
  const matrix = categories.map(category => {
    const categoryReports = data.rawData?.filter((r: any) => r.Category === category) || [];
    return {
      category,
      low: categoryReports.filter((r: any) => r.Urgency === 'low').length,
      medium: categoryReports.filter((r: any) => r.Urgency === 'medium').length,
      high: categoryReports.filter((r: any) => r.Urgency === 'high').length,
      total: categoryReports.length
    };
  }).sort((a, b) => b.total - a.total).slice(0, 5); // Show top 5

  const getMaxVal = () => Math.max(...matrix.map(m => Math.max(m.low, m.medium, m.high)), 1);
  const maxVal = getMaxVal();

  // Helper for hard matrix tile styling
  const getTileStyle = (val: number, type: 'low' | 'medium' | 'high') => {
    if (val === 0) return { background: 'transparent', opacity: 0.3, border: '1px solid rgba(128,128,128,0.1)' };

    const intensity = Math.min((val / maxVal) + 0.2, 1); 

    if (type === 'high') {
      return {
        background: `rgba(239, 68, 68, ${intensity * 0.25})`,
        border: `1px solid rgba(239, 68, 68, ${intensity * 0.8})`,
        color: '#ef4444', // city-red
        boxShadow: `inset 0 0 10px rgba(239, 68, 68, ${intensity * 0.2})`
      };
    }
    if (type === 'medium') {
      return {
        background: `rgba(249, 115, 22, ${intensity * 0.25})`,
        border: `1px solid rgba(249, 115, 22, ${intensity * 0.8})`,
        color: '#f97316', // city-orange
        boxShadow: `inset 0 0 10px rgba(249, 115, 22, ${intensity * 0.2})`
      };
    }
    return {
      background: `rgba(59, 130, 246, ${intensity * 0.25})`,
      border: `1px solid rgba(59, 130, 246, ${intensity * 0.8})`,
      color: '#3b82f6', // city-blue
      boxShadow: `inset 0 0 10px rgba(59, 130, 246, ${intensity * 0.2})`
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/40 dark:bg-city-surface/40 backdrop-blur-2xl rounded-3xl border border-gray-200/50 dark:border-white/10 p-6 h-full flex flex-col relative overflow-hidden shadow-2xl"
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none -z-10"></div>

      <div className="flex items-center justify-between mb-6 border-b border-gray-200/50 dark:border-white/10 pb-4 relative z-10">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Activity className="w-4 h-4 text-city-red animate-pulse" />
          Threat Heat Matrix
        </h3>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative z-10 pr-2">
        <table className="w-full text-sm border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="text-left pb-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold pl-2">Category</th>
              <th className="pb-2 text-center text-[10px] uppercase tracking-widest text-city-blue font-bold w-1/5">Low</th>
              <th className="pb-2 text-center text-[10px] uppercase tracking-widest text-city-orange font-bold w-1/5">Med</th>
              <th className="pb-2 text-center text-[10px] uppercase tracking-widest text-city-red font-bold w-[25%] animate-pulse">High</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.category} className="group border-b border-gray-200/50 dark:border-white/5">
                <td className="py-3 pl-2 font-black text-city-black dark:text-white text-xs uppercase tracking-tight truncate max-w-[100px]">
                  {row.category}
                </td>

                {['low', 'medium', 'high'].map((type) => {
                  const val = row[type as keyof typeof row] as number;
                  const style = getTileStyle(val, type as 'low' | 'medium' | 'high');

                  return (
                    <td key={type} className="px-1 text-center">
                      <div
                        className="h-10 rounded-md flex items-center justify-center font-black transition-all hover:scale-110 relative overflow-hidden backdrop-blur-sm"
                        style={style}
                      >
                         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4px_4px] mix-blend-overlay pointer-events-none"></div>
                        <span className="relative z-10 drop-shadow-sm">{val > 0 ? val : <span className="opacity-30">-</span>}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {matrix.length === 0 && (
          <div className="h-40 flex items-center justify-center text-gray-400 font-bold text-[10px] uppercase tracking-widest border border-dashed border-gray-200 dark:border-white/10 rounded-xl mt-4">
            Awaiting trace data stream...
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UrgencyTrendsChart;

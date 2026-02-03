import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

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

  // Helper for glass tile styling
  const getTileStyle = (val: number, type: 'low' | 'medium' | 'high') => {
    if (val === 0) return { background: 'transparent', opacity: 0.3 };

    const intensity = Math.min((val / maxVal) + 0.2, 1); // Boost opacity slightly

    if (type === 'high') {
      return {
        background: `rgba(239, 68, 68, ${intensity * 0.15})`,
        borderColor: `rgba(239, 68, 68, ${intensity * 0.8})`,
        boxShadow: `0 0 ${val * 2}px rgba(239, 68, 68, 0.3)`
      };
    }
    if (type === 'medium') {
      return {
        background: `rgba(234, 179, 8, ${intensity * 0.15})`,
        borderColor: `rgba(234, 179, 8, ${intensity * 0.8})`,
        boxShadow: `0 0 ${val * 2}px rgba(234, 179, 8, 0.3)`
      };
    }
    return {
      background: `rgba(59, 130, 246, ${intensity * 0.15})`,
      borderColor: `rgba(59, 130, 246, ${intensity * 0.8})`,
      boxShadow: `0 0 ${val * 2}px rgba(59, 130, 246, 0.3)`
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-6 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-electric-blue-500" />
          Risk Matrix
          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(Live Heatmap)</span>
        </h3>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-sm border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="text-left pb-2 text-xs uppercase tracking-wider text-gray-400 font-semibold pl-2">Category</th>
              <th className="pb-2 text-center text-xs uppercase tracking-wider text-blue-500 font-semibold w-1/5">Low</th>
              <th className="pb-2 text-center text-xs uppercase tracking-wider text-yellow-500 font-semibold w-1/5">Med</th>
              <th className="pb-2 text-center text-xs uppercase tracking-wider text-red-500 font-semibold w-1/5">High</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.category} className="group">
                <td className="py-2 pl-2 font-bold text-gray-700 dark:text-gray-300">
                  {row.category}
                </td>

                {['low', 'medium', 'high'].map((type) => {
                  const val = row[type as keyof typeof row] as number;
                  const style = getTileStyle(val, type as 'low' | 'medium' | 'high');

                  return (
                    <td key={type} className="px-1 text-center">
                      <div
                        className="h-10 rounded-lg flex items-center justify-center text-gray-900 dark:text-white font-black transition-all border border-transparent hover:scale-105"
                        style={style}
                      >
                        {val > 0 ? val : <span className="opacity-10">-</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {matrix.length === 0 && (
          <div className="h-40 flex items-center justify-center text-gray-500 text-sm italic">
            Awaiting data stream...
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UrgencyTrendsChart;

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DepartmentBarChartProps {
  data: {
    categoryBreakdown: Record<string, number>;
    rawData?: any[];
  };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, p: any) => sum + p.value, 0);
    return (
      <div className="bg-white/95 dark:bg-midnight-900/95 backdrop-blur p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 min-w-[150px]">
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-2 pb-2 border-b border-gray-100 dark:border-gray-800">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between py-1">
            <span className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color.startsWith('url') ? entry.color === 'url(#highGradient)' ? '#ef4444' : entry.color === 'url(#medGradient)' ? '#f59e0b' : '#3b82f6' : entry.color }} />
              {entry.name}
            </span>
            <span className="text-sm font-bold" style={{ color: entry.color.startsWith('url') ? entry.color === 'url(#highGradient)' ? '#ef4444' : entry.color === 'url(#medGradient)' ? '#f59e0b' : '#3b82f6' : entry.color }}>{entry.value}</span>
          </div>
        ))}
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
          <span className="text-gray-500 font-medium">TOTAL</span>
          <span className="text-gray-900 dark:text-white font-bold">{total}</span>
        </div>
      </div>
    );
  }
  return null;
};

const DepartmentBarChart: React.FC<DepartmentBarChartProps> = ({ data }) => {
  const categories = Object.keys(data.categoryBreakdown);

  const chartData = categories.map(category => {
    const categoryReports = data.rawData?.filter(r => r.Category === category) || [];
    return {
      category: category,
      High: categoryReports.filter(r => r.Urgency === 'high').length,
      Medium: categoryReports.filter(r => r.Urgency === 'medium').length,
      Low: categoryReports.filter(r => r.Urgency === 'low').length
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card rounded-2xl p-6 h-full flex flex-col relative overflow-hidden"
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50"></div>

      <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-gray-100">
        🏢 Department Workload
      </h3>

      <div className="flex-1 min-h-[300px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }} barGap={2}>
              <defs>
                <linearGradient id="highGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
                <linearGradient id="medGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="lowGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" opacity={0.1} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="category"
                stroke="#9ca3af"
                fontSize={13}
                width={90}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6b7280', fontWeight: 500 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)', radius: 8 }} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="High" stackId="a" fill="url(#highGradient)" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500} />
              <Bar dataKey="Medium" stackId="a" fill="url(#medGradient)" barSize={24} animationDuration={1500} />
              <Bar dataKey="Low" stackId="a" fill="url(#lowGradient)" radius={[4, 0, 0, 4]} barSize={24} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">No reports to analyze</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DepartmentBarChart;

import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatusPieChartProps {
  data: {
    total: number;
    pending: number;
    resolved: number;
  };
}

const CustomTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const percentage = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
    return (
      <div className="bg-white/90 dark:bg-midnight-900/90 backdrop-blur p-3 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {payload[0].name}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {payload[0].value} reports <span className="text-gray-400 dark:text-gray-500">({percentage}%)</span>
        </p>
      </div>
    );
  }
  return null;
};

const StatusPieChart: React.FC<StatusPieChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Pending', value: data.pending, color: 'url(#pendingGradient)' },
    { name: 'Resolved', value: data.resolved, color: 'url(#resolvedGradient)' },
  ];

  // If no data, show empty state
  const renderData = data.total > 0 ? chartData : [{ name: 'No Data', value: 1, color: '#e5e7eb' }];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-6 h-full flex flex-col relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-electric-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

      <div className="flex items-center justify-between mb-2 relative z-10">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Status Overview</h3>
      </div>

      <div className="flex-1 min-h-[300px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <linearGradient id="pendingGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="resolvedGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            <Pie
              data={renderData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={5}
              dataKey="value"
              cornerRadius={8}
              stroke="none"
            >
              {renderData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={data.total > 0 ? entry.color : '#e5e7eb'}
                  style={{ filter: data.total > 0 ? 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))' : 'none' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip total={data.total} />} cursor={false} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value, entry: any) => (
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 ml-1">
                  {value} <span className="text-gray-400 dark:text-gray-500 text-xs">({entry.payload.value})</span>
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text with Glow */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <div className="relative">
            <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300">
              {data.total}
            </span>
          </div>
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Total Reports</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StatusPieChart;

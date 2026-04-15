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
      <div className="bg-white/95 dark:bg-city-black/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 p-5 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-city-blue/10 blur-[30px] rounded-full pointer-events-none -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none z-0"></div>

        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 relative z-10">
          {payload[0].name} Status
        </p>
        <p className="font-heading text-2xl font-black text-city-black dark:text-white uppercase relative z-10 flex items-end gap-2">
          {payload[0].value} <span className="text-gray-500 font-bold tracking-[0.2em] text-[10px] mb-1">({percentage}%)</span>
        </p>
      </div>
    );
  }
  return null;
};

const StatusPieChart: React.FC<StatusPieChartProps> = ({ data }) => {
  // Using city-orange for pending, city-green for resolved
  const chartData = [
    { name: 'Pending', value: data.pending, color: '#f97316' }, // city-orange
    { name: 'Resolved', value: data.resolved, color: '#22c55e' }, // city-green
  ];

  const renderData = data.total > 0 ? chartData : [{ name: 'No Data', value: 1, color: '#374151' }];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/40 dark:bg-city-surface/40 backdrop-blur-2xl rounded-3xl border border-gray-200/50 dark:border-white/10 p-6 h-full flex flex-col relative overflow-hidden group shadow-2xl"
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none -z-10"></div>
      
      <div className="absolute top-0 right-0 w-48 h-48 bg-city-blue/10 dark:bg-city-blue/5 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none group-hover:scale-125 group-hover:bg-city-blue/15 transition-all duration-1000"></div>

      <div className="flex items-center justify-between mb-4 relative z-10 border-b border-gray-200/50 dark:border-white/10 pb-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            Status Overview
        </h3>
      </div>

      <div className="flex-1 min-h-[300px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={renderData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={115}
              paddingAngle={2}
              dataKey="value"
              cornerRadius={2}
              stroke="none"
              strokeWidth={0}
            >
              {renderData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={data.total > 0 ? entry.color : 'rgba(107, 114, 128, 0.2)'}
                  style={{ filter: data.total > 0 ? `drop-shadow(0 0 10px ${entry.color}40)` : 'none' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip total={data.total} />} cursor={false} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value, entry: any) => (
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
                  {value} <span className="text-gray-400 dark:text-gray-600">({entry.payload.value})</span>
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <div className="relative">
            <span className="font-heading text-6xl font-black text-city-black dark:text-white drop-shadow-sm">
              {data.total}
            </span>
          </div>
          <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-1 relative">All Trace Logs</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StatusPieChart;

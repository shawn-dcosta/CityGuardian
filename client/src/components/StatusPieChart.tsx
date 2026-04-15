import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface StatusPieChartProps {
  data: {
    total: number;
    pending: number;
    resolved: number;
  };
}

const StatusPieChart: React.FC<StatusPieChartProps> = ({ data }) => {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  // Using city-orange for pending, city-green for resolved
  const chartData = [
    { name: 'Pending', value: data.pending, color: '#f97316' }, // city-orange
    { name: 'Resolved', value: data.resolved, color: '#22c55e' }, // city-green
  ];

  const renderData = data.total > 0 ? chartData : [{ name: 'No Data', value: 1, color: '#374151' }];

  const onPieEnter = (_: any, index: number) => {
    setHoveredSlice(index);
  };

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
              onMouseEnter={onPieEnter}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              {renderData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={data.total > 0 ? entry.color : 'rgba(107, 114, 128, 0.2)'}
                  style={{ 
                    filter: data.total > 0 ? `drop-shadow(0 0 10px ${entry.color}40)` : 'none',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </Pie>
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

        {/* Fixed HUD Panel near legend */}
        <AnimatePresence>
          {hoveredSlice !== null && data.total > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20, y: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 10, y: 5 }}
              className="absolute bottom-16 right-6 p-4 bg-white/90 dark:bg-city-black/90 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl shadow-2xl z-20 min-w-[150px] overflow-hidden"
            >
              {/* Internal Accent Glow */}
              <div 
                className="absolute top-0 right-0 w-16 h-16 blur-[20px] rounded-full opacity-20 pointer-events-none -z-10 translate-x-1/2 -translate-y-1/2"
                style={{ backgroundColor: renderData[hoveredSlice]?.color || '#3b82f6' }}
              ></div>

              <div className="flex items-center gap-2 mb-1.5">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse shadow-sm"
                  style={{ backgroundColor: renderData[hoveredSlice]?.color || '#3b82f6' }}
                ></div>
                <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  {renderData[hoveredSlice]?.name} LOGS
                </p>
              </div>

              <div className="flex items-end gap-2 relative z-10">
                <span className="font-heading text-3xl font-black text-city-black dark:text-white leading-none">
                  {renderData[hoveredSlice]?.value}
                </span>
                <span className="text-[10px] font-bold text-city-blue uppercase tracking-widest mb-1">
                  ({((renderData[hoveredSlice]?.value / data.total) * 100).toFixed(1)}%)
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default StatusPieChart;

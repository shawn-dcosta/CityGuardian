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
      <div className="bg-white border border-city-black/20 p-4 shadow-2xl min-w-[200px]">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 pb-2 border-b border-gray-100">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between py-1">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <span className="w-2 h-2" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="text-sm font-black" style={{ color: entry.color }}>{entry.value}</span>
          </div>
        ))}
        <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
          <span className="text-gray-400">TOTAL</span>
          <span className="text-city-black text-sm">{total}</span>
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
      className="bg-white/40 dark:bg-city-surface/40 backdrop-blur-2xl rounded-3xl border border-gray-200/50 dark:border-white/10 p-6 h-full flex flex-col relative overflow-hidden group shadow-2xl"
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none -z-10"></div>
      
      <div className="absolute top-0 right-0 w-48 h-48 bg-city-blue/10 dark:bg-city-blue/5 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none group-hover:scale-125 group-hover:bg-city-blue/15 transition-all duration-1000"></div>

      <div className="flex items-center justify-between mb-4 relative z-10 border-b border-gray-200/50 dark:border-white/10 pb-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            Reports by Category
        </h3>
      </div>

      <div className="flex-1 min-h-[300px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }} barGap={0.5}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#000" opacity={0.05} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="category"
                stroke="#6b7280"
                fontSize={10}
                width={70}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6b7280', fontWeight: 800, style: { textTransform: 'uppercase' } }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="square"
                iconSize={8}
                formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{value}</span>}
              />
              {/* city-red, city-orange, city-blue colors respectively */}
              <Bar dataKey="High" stackId="a" fill="#ef4444" radius={0} barSize={20} animationDuration={1000} />
              <Bar dataKey="Medium" stackId="a" fill="#f97316" barSize={20} animationDuration={1000} />
              <Bar dataKey="Low" stackId="a" fill="#3b82f6" radius={0} barSize={20} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Awaiting vector data</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DepartmentBarChart;

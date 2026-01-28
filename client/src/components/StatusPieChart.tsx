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
      <div className="glass-card p-3 rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {payload[0].name}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {payload[0].value} reports ({percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

const StatusPieChart: React.FC<StatusPieChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Pending', value: data.pending, color: '#ef4444' },
    { name: 'Resolved', value: data.resolved, color: '#10b981' }
  ];



  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-6 h-full"
    >
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
        📌 Status Overview
      </h3>

      {data.total > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip total={data.total} />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {value}: {entry.payload?.value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">No data available yet</p>
        </div>
      )}
    </motion.div>
  );
};

export default StatusPieChart;

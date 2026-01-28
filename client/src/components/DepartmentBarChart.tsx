import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DepartmentBarChartProps {
  data: {
    categoryBreakdown: Record<string, number>;
    rawData?: any[];
  };
}

const DepartmentBarChart: React.FC<DepartmentBarChartProps> = ({ data }) => {
  // Transform data for stacked bar chart
  const categories = Object.keys(data.categoryBreakdown);

  const chartData = categories.map(category => {
    const categoryReports = data.rawData?.filter(r => r.Category === category) || [];
    return {
      category: category,
      high: categoryReports.filter(r => r.Urgency === 'high').length,
      medium: categoryReports.filter(r => r.Urgency === 'medium').length,
      low: categoryReports.filter(r => r.Urgency === 'low').length
    };
  });



  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card rounded-2xl p-6 h-full"
    >
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
        🏢 Department Workload
      </h3>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" />
            <YAxis
              type="category"
              dataKey="category"
              stroke="#6b7280"
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {value}
                </span>
              )}
            />
            <Bar dataKey="high" stackId="a" fill="#d97706" name="High" radius={[0, 4, 4, 0]} />
            <Bar dataKey="medium" stackId="a" fill="#eab308" name="Medium" />
            <Bar dataKey="low" stackId="a" fill="#3b82f6" name="Low" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Waiting for first report...</p>
        </div>
      )}
    </motion.div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, p: any) => sum + p.value, 0);
    return (
      <div className="glass-card p-3 rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1 pt-1 border-t border-gray-200 dark:border-gray-600">
          Total: {total}
        </p>
      </div>
    );
  }
  return null;
};

export default DepartmentBarChart;

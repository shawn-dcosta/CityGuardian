import { motion } from 'framer-motion';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

interface UrgencyTrendsChartProps {
  data: {
    categoryBreakdown: Record<string, number>;
    rawData?: any[];
    total: number;
  };
}

const CustomContent = (props: any) => {
  const { x, y, width, height, name, size, color } = props;

  if (width < 30 || height < 20) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color || '#3b82f6',
          stroke: '#fff',
          strokeWidth: 2,
          opacity: 0.9
        }}
      />
      {width > 60 && height > 40 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 8}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
            fontWeight="bold"
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 8}
            textAnchor="middle"
            fill="#fff"
            fontSize={14}
            fontWeight="bold"
          >
            {size}
          </text>
        </>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-3 rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {data.name}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Reports: {data.size || 0}
        </p>
      </div>
    );
  }
  return null;
};

const UrgencyTrendsChart: React.FC<UrgencyTrendsChartProps> = ({ data }) => {
  // Transform data for treemap
  const transformData = () => {
    const categories = Object.keys(data.categoryBreakdown);

    const children = categories.map(category => {
      const categoryReports = data.rawData?.filter((r: any) => r.Category === category) || [];
      const urgencyCounts = {
        high: categoryReports.filter((r: any) => r.Urgency === 'high').length,
        medium: categoryReports.filter((r: any) => r.Urgency === 'medium').length,
        low: categoryReports.filter((r: any) => r.Urgency === 'low').length
      };

      return {
        name: category,
        children: [
          { name: 'High', size: urgencyCounts.high, color: '#ef4444' },
          { name: 'Medium', size: urgencyCounts.medium, color: '#eab308' },
          { name: 'Low', size: urgencyCounts.low, color: '#3b82f6' }
        ].filter(item => item.size > 0)
      };
    }).filter(category => category.children.length > 0);

    return [{ name: 'Root', children }];
  };



  const chartData = transformData();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-6 h-full"
    >
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
        📈 Category & Urgency Matrix
      </h3>

      {data.total > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <Treemap
            data={chartData}
            dataKey="size"
            stroke="#fff"
            fill="#8884d8"
            content={<CustomContent />}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      ) : (
        <div className="h-[350px] flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Medium Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Low Priority</span>
        </div>
      </div>
    </motion.div>
  );
};

export default UrgencyTrendsChart;

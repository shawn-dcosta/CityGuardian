import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  Activity
} from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusPieChart from '../components/StatusPieChart';
import DepartmentBarChart from '../components/DepartmentBarChart';
import HeatMap from '../components/HeatMap';
import UrgencyTrendsChart from '../components/UrgencyTrendsChart';
import { fetchReportsData, calculateStats } from '../services/dataService';
import { useAuth } from '../context/AuthContext';

interface DashboardProps {
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    pending: 0,
    resolved: 0,
    successRate: 0,
    categoryBreakdown: {},
    urgencyBreakdown: {},
    rawData: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      let reports = await fetchReportsData();

      // Filter reports for public users
      if (user && user.role !== 'admin') {
        const userReportIds = user.reportIds || [];
        reports = reports.filter((r: any) => userReportIds.includes(r.ID));
      }

      setData(reports as any[]);

      const calculatedStats = calculateStats(reports as any[]);
      // Add raw data for charts
      setStats({ ...calculatedStats, rawData: reports as any[] });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    loadData();
  };

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-electric-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-deep-charcoal-900 dark:via-deep-charcoal-800 dark:to-deep-charcoal-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-electric-blue-600 to-electric-blue-800 dark:from-electric-blue-400 dark:to-electric-blue-600 bg-clip-text text-transparent">
                🛡️ Executive Command Center
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Real-time civic issue monitoring and analytics
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {lastUpdated.toLocaleTimeString()}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={loading}
                className="p-3 glass-card rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-electric-blue-600 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Reports"
            value={stats.total}
            icon={BarChart3}
            color="blue"
          />

          <StatCard
            title="Active Cases"
            value={stats.pending}
            icon={Clock}
            color="red"
          />

          <StatCard
            title="Resolved"
            value={stats.resolved}
            icon={CheckCircle}
            color="green"
          />

          <StatCard
            title="Success Rate"
            value={stats.successRate}
            suffix="%"
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <StatusPieChart data={stats} />
          <DepartmentBarChart data={stats} />
        </div>

        {/* Charts Row 2 - Map and Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <HeatMap data={data} isDarkMode={isDarkMode} />
          </div>

          <div className="lg:col-span-1">
            <UrgencyTrendsChart data={stats} />
          </div>
        </div>

        {/* Recent Activity Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Reports
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing latest {Math.min(10, data.length)} reports
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Issue
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Urgency
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((report, index) => (
                  <motion.tr
                    key={report.ID || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      #{report.ID || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                      {report.Category || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {report.issue || report.Issue || 'No description'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${report.Urgency === 'high'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : report.Urgency === 'medium'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                        {report.Urgency || 'medium'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${report.Status === 'Resolved'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                        {report.Status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {report.Date || 'N/A'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No reports available yet</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

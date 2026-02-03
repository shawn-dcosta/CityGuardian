import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  Activity,
  ArrowRight
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ReportCard from '../components/ReportCard';
import ReportDetailsModal from '../components/ReportDetailsModal';
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

  // New State for Interactions
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [viewAll, setViewAll] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-midnight-900 dark:via-midnight-800 dark:to-midnight-900 p-6">
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

        {/* Recent Activity Grid (Bento Style) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-electric-blue-500" />
              {viewAll ? 'All Reports' : 'Live Reports Feed'}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setViewAll(!viewAll)}
                className="text-sm font-medium text-electric-blue-600 hover:text-electric-blue-700 dark:text-electric-blue-400 flex items-center gap-1 transition-colors"
              >
                {viewAll ? 'Show Less' : 'View All'}
                <ArrowRight className={`w-4 h-4 transition-transform ${viewAll ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>

          {data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(viewAll ? data : data.slice(0, 8)).map((report, index) => (
                <ReportCard
                  key={report.ID || index}
                  report={report}
                  index={index}
                  onClick={(r) => setSelectedReport(r)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-card rounded-2xl">
              <p className="text-gray-500 dark:text-gray-400">No reports available yet.</p>
            </div>
          )}
        </motion.div>


      </div>
      {/* Report Details Modal */}
      <ReportDetailsModal
        isOpen={!!selectedReport}
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div >
  );
};

export default Dashboard;

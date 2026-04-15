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
      <div className="min-h-screen flex items-center justify-center bg-city-surface-light dark:bg-city-black relative font-sans">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay"></div>
        <div className="text-center relative z-10 p-8 bg-white/50 dark:bg-city-surface/50 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl">
          <div className="h-1.5 w-48 bg-gray-200 dark:bg-white/10 mx-auto mb-6 relative overflow-hidden rounded-full">
            <div className="absolute top-0 left-0 h-full w-1/3 bg-city-blue drop-shadow-[0_0_8px_rgba(37,99,235,1)] animate-[ping_1.5s_infinite]"></div>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-city-black dark:text-gray-400">Establishing <span className="text-city-blue">Uplink</span>...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-city-surface-light dark:bg-city-black relative overflow-x-hidden pt-12 pb-16 font-sans">
      {/* Cinematic Ambient Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-city-blue/5 dark:bg-city-blue/10 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse duration-[5000ms]" />
      <div className="absolute top-[40%] left-[-10%] w-[600px] h-[600px] bg-city-red/5 dark:bg-city-red/10 blur-[150px] rounded-full pointer-events-none -z-10" style={{ animation: "pulse 7s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
      
      {/* Texture Overlays */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none mix-blend-overlay -z-10"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="max-w-[1400px] mx-auto relative z-10 px-6 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200/50 dark:border-white/10 pb-8 backdrop-blur-sm"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full mb-4 shadow-inner">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-city-blue opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-city-blue"></span>
                </span>
                <p className="text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
                    Clearance: <span className="text-city-red">{user?.role || 'Admin'}</span>
                </p>
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-black text-city-black dark:text-white uppercase tracking-tighter mb-2 drop-shadow-md">
              Ops <span className="text-transparent bg-clip-text bg-gradient-to-br from-city-blue to-blue-400 dark:from-city-blue dark:to-blue-200">Command</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mt-2">
              Executive Overview Matrix
            </p>
          </div>

          <div className="flex items-center gap-6 bg-white/60 dark:bg-city-surface/60 backdrop-blur-md p-4 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
            <div className="text-right border-r border-gray-200 dark:border-white/10 pr-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Network Sync</p>
              <p className="text-sm font-black text-city-black dark:text-white tracking-wider">
                {lastUpdated.toLocaleTimeString()}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={loading}
              className="p-3.5 bg-city-blue/10 dark:bg-city-blue/20 text-city-blue hover:bg-city-blue hover:text-white rounded-xl transition-colors disabled:opacity-50 relative group"
            >
              <div className="absolute inset-0 bg-city-blue opacity-0 group-hover:opacity-40 blur-md transition-opacity rounded-xl"></div>
              <RefreshCw className={`w-5 h-5 relative z-10 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          <div className="lg:col-span-2 relative group">
            {/* Soft glow for map container */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-city-blue/20 to-city-red/20 blur opacity-0 group-hover:opacity-100 transition duration-1000 rounded-2xl pointer-events-none"></div>
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
          className="mb-8 bg-white/40 dark:bg-city-surface/40 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-lg shadow-gray-200/20 dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-8 border-b border-gray-200/50 dark:border-white/10 pb-6">
            <h3 className="text-sm font-bold text-city-black dark:text-gray-300 uppercase tracking-[0.2em] flex items-center gap-3">
              <div className="p-1.5 bg-city-red/10 rounded-md">
                 <Activity className="w-4 h-4 text-city-red" />
              </div>
              {viewAll ? 'All Operations' : 'Active Manifest Feed'}
            </h3>
            {data.length > 8 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setViewAll(!viewAll)}
                  className="px-4 py-2 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold text-city-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-2 transition-all"
                >
                  {viewAll ? 'Show Less' : 'View Expanded'}
                  <ArrowRight className={`w-3 h-3 transition-transform ${viewAll ? 'rotate-90' : ''}`} />
                </button>
              </div>
            )}
          </div>

          {data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
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
            <div className="text-center py-20 bg-white/50 dark:bg-city-surface/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300 dark:border-white/20">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Awaiting field data logs...</p>
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, AlertTriangle, Calendar, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchReportsData } from '../services/dataService'; // We reuse this service

interface ImpactHistoryProps {
  refreshTrigger: number;
}

interface HistoryItem {
  ID: string;
  Date: string;
  Category: string;
  Urgency: 'high' | 'medium' | 'low';
  issue: string; // The service returns 'issue' (lowercase) or 'Issue' (uppercase), we handle both
}

const ImpactHistory: React.FC<ImpactHistoryProps> = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) {
        setHistory([]);
        return;
      }

      try {
        setLoading(true);
        // Fetch all reports (this is cached/proxied)
        const allReports = await fetchReportsData();
        console.log('ImpactHistory: Loaded Reports', allReports.length);
        console.log('ImpactHistory: User Role', user.role);
        console.log('ImpactHistory: User Report IDs', user.reportIds);

        let userReports: any[] = [];

        if (user.role === 'admin') {
          // Admin sees EVERYTHING
          userReports = allReports;
        } else {
          // Regular user sees only their linked reports
          const userReportIds = user.reportIds || [];
          userReports = allReports.filter((r: any) => userReportIds.includes(r.ID));
        }

        // Sort by date descending (assuming Date exists, otherwise use ID which is timestamp)
        userReports.sort((a: any, b: any) => {
          const dateA = new Date(a.Date).getTime();
          const dateB = new Date(b.Date).getTime();
          return dateB - dateA || (parseInt(b.ID) - parseInt(a.ID));
        });

        // Limit to recent 10 for display in this specific component if needed, or show all
        // The UI seems designed for a list, let's show top 5-10
        setHistory(userReports.slice(0, 5) as unknown as HistoryItem[]);

      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [refreshTrigger, user]);

  const urgencyColors: Record<string, string> = {
    high: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-2xl p-6"
    >
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
        <History className="w-5 h-5 text-electric-blue-500" />
        {user?.role === 'admin' ? 'All Recent Reports' : 'Your Recent Reports'}
      </h3>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader className="w-8 h-8 animate-spin text-electric-blue-500" />
        </div>
      ) : history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <History className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user ? "No reports found in history." : "Sign in to view your report history."}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {history.map((report, index) => (
              <motion.div
                key={report.ID || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="glass-input rounded-xl p-4 border hover:border-electric-blue-500/50 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-electric-blue-500" />
                    <span className="text-sm font-semibold text-electric-blue-600 dark:text-electric-blue-400">
                      {report.Category || 'Report'}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${urgencyColors[report.Urgency?.toLowerCase() || 'medium'] || urgencyColors.medium
                      }`}
                  >
                    {report.Urgency || 'Medium'}
                  </span>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                  {(report as any).issue || (report as any).Issue || report.Category}
                </p>

                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{report.Date}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default ImpactHistory;

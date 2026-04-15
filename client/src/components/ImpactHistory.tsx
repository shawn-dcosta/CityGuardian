import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, AlertTriangle, Calendar, Loader, ChevronRight } from 'lucide-react';
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

  const urgencyProps: Record<string, { color: string, bg: string, border: string }> = {
    high: { color: 'text-city-red', bg: 'bg-city-red/10 dark:bg-city-red/20', border: 'border-city-red/30' },
    medium: { color: 'text-city-orange', bg: 'bg-city-orange/10 dark:bg-city-orange/20', border: 'border-city-orange/30' },
    low: { color: 'text-city-green', bg: 'bg-city-green/10 dark:bg-city-green/20', border: 'border-city-green/30' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/5 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none -z-10"></div>
      
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
        <div className="p-2 rounded-xl bg-city-blue/10 dark:bg-city-blue/20 border border-city-blue/20 shadow-inner">
            <History className="w-5 h-5 text-city-blue" />
        </div>
        <div>
            <h3 className="font-heading text-2xl font-black uppercase tracking-tighter text-city-black dark:text-white drop-shadow-sm">
                {user?.role === 'admin' ? 'Network History' : 'Operative Logs'}
            </h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Recent system traces</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-city-blue drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
        </div>
      ) : history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white/40 dark:bg-white/5 rounded-2xl border border-gray-200/50 dark:border-white/5 shadow-inner"
        >
          <History className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600 opacity-50" />
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {user ? "No traces established." : "Authentication required."}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {history.map((report, index) => {
              const uProps = urgencyProps[report.Urgency?.toLowerCase() || 'medium'] || urgencyProps.medium;
              return (
                <motion.div
                  key={report.ID || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-white dark:bg-city-black border border-gray-200 dark:border-white/5 rounded-2xl p-5 hover:border-city-blue/50 dark:hover:border-city-blue/50 transition-all shadow-sm hover:shadow-md overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-city-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 group-hover:bg-city-blue/10 transition-colors">
                          <AlertTriangle className={`w-4 h-4 text-gray-400 group-hover:text-city-blue transition-colors`} />
                      </div>
                      <span className="text-sm font-black uppercase tracking-wider text-city-black dark:text-white drop-shadow-sm group-hover:text-city-blue transition-colors line-clamp-1">
                        {report.Category || 'Unknown Vector'}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${uProps.bg} ${uProps.color} ${uProps.border}`}
                    >
                      {report.Urgency || 'Medium'}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 pl-1 relative z-10">
                    {(report as any).issue || (report as any).Issue || report.Category}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5 relative z-10">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{report.Date}</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <ChevronRight className="w-3 h-3 text-city-blue" />
                      </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default ImpactHistory;

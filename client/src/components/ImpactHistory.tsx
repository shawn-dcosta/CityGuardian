import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, AlertTriangle, Calendar } from 'lucide-react';
import { getHistory } from '../utils/helpers';

interface ImpactHistoryProps {
  refreshTrigger: number;
}

interface HistoryItem {
  id: number;
  date: string;
  department: string;
  urgency: 'high' | 'medium' | 'low';
  complaint: string;
}

const ImpactHistory: React.FC<ImpactHistoryProps> = ({ refreshTrigger }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory() as HistoryItem[]);
  }, [refreshTrigger]);

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
        Your Recent Reports
      </h3>

      {history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <History className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No reports found locally.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {history.map((report, index) => (
              <motion.div
                key={report.id}
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
                      {report.department}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${urgencyColors[report.urgency] || urgencyColors.medium
                      }`}
                  >
                    {report.urgency}
                  </span>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                  {report.complaint}
                </p>

                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{report.date}</span>
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

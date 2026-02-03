import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface ReportCardProps {
    report: any;
    onClick?: (report: any) => void;
    index?: number;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onClick, index = 0 }) => {
    const urgencyColors = {
        high: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
        medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        low: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    };

    const statusColors = {
        Resolved: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
        Pending: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400',
        'In Progress': 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onClick && onClick(report)}
            className="glass-card p-5 rounded-2xl cursor-pointer group hover:shadow-xl transition-all border border-gray-100 dark:border-gray-800"
        >
            <div className="flex justify-between items-start mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${urgencyColors[report.Urgency as keyof typeof urgencyColors] || urgencyColors.medium}`}>
                    {report.Urgency} Priority
                </span>
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${statusColors[report.Status as keyof typeof statusColors] || statusColors.Pending}`}>
                    {report.Status === 'Resolved' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {report.Status}
                </span>
            </div>

            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 line-clamp-1 group-hover:text-electric-blue-500 transition-colors">
                {report.Category} Issue
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 h-10">
                {report.issue || report.Issue || 'No description provided.'}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {report.Date}
                    </span>
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {report.Location || report.location ? 'View Map' : 'No Loc'}
                    </span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-electric-blue-500" />
            </div>
        </motion.div>
    );
};

export default ReportCard;

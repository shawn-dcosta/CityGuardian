import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Target } from 'lucide-react';

interface ReportCardProps {
    report: any;
    onClick?: (report: any) => void;
    index?: number;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onClick, index = 0 }) => {
    const isHighPriority = report.Urgency?.toLowerCase() === 'high';
    const currentStep = report.Status === 'Resolved' ? 4 : (report.Status === 'Pending' ? 1 : 2);
    const isResolved = currentStep === 4;

    let borderColor = 'border-l-city-blue/50 group-hover:border-l-city-blue/80';
    if (isResolved) borderColor = 'border-l-city-green/50 group-hover:border-l-city-green/80';
    if (isHighPriority) borderColor = 'border-l-city-red/50 group-hover:border-l-city-red/80 text-city-red';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.1 }}
            onClick={() => onClick && onClick(report)}
            className={`bg-white/80 dark:bg-city-surface/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/5 shadow-sm hover:shadow-lg dark:shadow-none group cursor-pointer transition-all duration-300 border-l-[4px] ${borderColor} hover:-translate-y-1 font-sans overflow-hidden`}
        >
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-black/5 dark:from-white/5 to-transparent skew-x-12 translate-x-20 group-hover:translate-x-10 transition-transform duration-700 opacity-0 group-hover:opacity-100 pointer-events-none" />

            <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md shadow-inner">
                        ID:{report.ID || 'N/A'}
                    </span>
                    <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-md shadow-inner ${
                        isHighPriority ? 'bg-city-red text-white border border-city-red' : 
                        report.Urgency?.toLowerCase() === 'medium' ? 'bg-city-orange/10 dark:bg-city-orange/20 text-city-orange border border-city-orange/20' : 'bg-city-blue/10 dark:bg-city-blue/20 text-city-blue border border-city-blue/20'
                    }`}>
                        {report.Urgency || 'MEDIUM'} PRTY
                    </span>
                </div>

                <h3 className="font-heading text-2xl font-black text-city-black dark:text-white uppercase tracking-tight mb-2 line-clamp-1 group-hover:text-city-blue dark:group-hover:text-city-blue transition-colors drop-shadow-sm">
                    {report.Category || 'ANOMALY'}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium line-clamp-2 h-10 mb-6 group-hover:underline decoration-gray-300 dark:decoration-gray-600 underline-offset-4">
                    {report.issue || report.Issue || 'Awaiting classification...'}
                </p>

                {/* Progress Mini-Bar */}
                <div className="w-full bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 h-1.5 rounded-full mb-5 relative overflow-hidden shadow-inner">
                    <div 
                        className={`absolute inset-y-0 left-0 rounded-full ${isResolved ? 'bg-city-green drop-shadow-[0_0_5px_rgba(0,230,118,0.8)]' : isHighPriority ? 'bg-city-red drop-shadow-[0_0_5px_rgba(211,18,18,0.8)]' : 'bg-city-blue drop-shadow-[0_0_5px_rgba(37,99,235,0.8)]'}`}
                        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                    />
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500 pt-4 border-t border-gray-200/50 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                            <Calendar className="w-3 h-3 text-city-blue/80" />
                            {report.Date || 'UNKNOWN'}
                        </span>
                        <span className="flex items-center gap-1.5 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                            <Target className="w-3 h-3 text-city-red/80" />
                            {report.Location || report.location ? 'LOC LOGGED' : 'NO LOC'}
                        </span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-city-blue group-hover:border-city-blue transition-all group-hover:shadow-[0_0_10px_rgba(37,99,235,0.4)]">
                        <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ReportCard;

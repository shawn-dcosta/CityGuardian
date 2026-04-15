import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Clock, CheckCircle, Tag, User, Download } from 'lucide-react';

import { generatePDF } from '../utils/helpers';
import { AI_API_URL } from '../config';

interface ReportDetailsModalProps {
    report: any;
    isOpen: boolean;
    onClose: () => void;
}

const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({ report, isOpen, onClose }) => {
    if (!report) return null;

    const handleDownload = async () => {
        let imageSource = null;
        const rawImage = report.image || report.Image;

        if (rawImage) {
            if (rawImage.startsWith('http')) {
                imageSource = rawImage;
            } else {
                imageSource = `${AI_API_URL}/${rawImage}`;
            }
        }

        await generatePDF(
            report.Name || "Reporter",
            report.issue || report.Issue || "No description",
            report.Category || "General",
            report.Location || report.location || "Unknown Location",
            imageSource
        );
    };

    const isResolved = report.Status === 'Resolved';
    const isHighPriority = report.Urgency?.toLowerCase() === 'high';

    let themeColor = 'city-blue';
    let themeBg = 'bg-city-blue';
    let themeBorder = 'border-city-blue';
    let themeText = 'text-city-blue';
    let themeShadow = 'shadow-[0_0_30px_rgba(37,99,235,0.3)]';
    
    if (isResolved) {
        themeColor = 'city-green';
        themeBg = 'bg-city-green';
        themeBorder = 'border-city-green';
        themeText = 'text-city-green';
        themeShadow = 'shadow-[0_0_30px_rgba(0,230,118,0.3)]';
    } else if (isHighPriority) {
        themeColor = 'city-red';
        themeBg = 'bg-city-red';
        themeBorder = 'border-city-red';
        themeText = 'text-city-red';
        themeShadow = 'shadow-[0_0_30px_rgba(211,18,18,0.3)]';
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 xl:p-0 font-sans">
                    {/* Cinematic Blur Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-city-surface-light/80 dark:bg-[#050505]/95 backdrop-blur-xl transition-opacity cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay"></div>
                    </motion.div>

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30, rotateX: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`bg-white/95 dark:bg-city-surface/95 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden relative ${themeShadow} dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]`}
                    >
                        {/* Decorative Top Bar reflecting status */}
                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${themeBg} drop-shadow-[0_0_15px_currentColor]`} />

                        {/* Cinematic Light Accents */}
                        <div className={`absolute top-0 right-0 w-80 h-80 bg-${themeColor}/5 dark:bg-${themeColor}/10 blur-[80px] rounded-full pointer-events-none`} />
                        <div className={`absolute bottom-0 left-0 w-80 h-80 bg-${themeColor}/5 dark:bg-${themeColor}/10 blur-[80px] rounded-full pointer-events-none`} />

                        {/* Header */}
                        <div className="p-8 md:p-10 pb-6 border-b border-gray-200/50 dark:border-white/10 flex justify-between items-start relative z-10">
                            <div className="pr-12">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md shadow-inner ${
                                        isHighPriority ? 'bg-city-red text-white border border-city-red' : 
                                        report.Urgency?.toLowerCase() === 'medium' ? 'bg-city-orange/10 dark:bg-city-orange/20 text-city-orange border border-city-orange/20' : 'bg-city-blue/10 dark:bg-city-blue/20 text-city-blue border border-city-blue/20'
                                    }`}>
                                        {report.Urgency} PRTY
                                    </span>
                                    <div className="px-3 py-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg flex items-center gap-2 shadow-inner">
                                        <span className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">ID:{report.ID}</span>
                                        <span className={`w-1.5 h-1.5 rounded-full ${themeBg} animate-pulse`} />
                                    </div>
                                </div>
                                <h2 className="font-heading text-4xl md:text-5xl font-black text-city-black dark:text-white uppercase tracking-tighter leading-[0.9] mt-1 drop-shadow-sm">
                                    {report.Category} Anomaly
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute top-8 right-8 w-11 h-11 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 hover:scale-105 active:scale-95 transition-all text-gray-500 dark:text-gray-400 group"
                            >
                                <X className="w-5 h-5 group-hover:text-city-black dark:group-hover:text-white transition-colors" />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-8 md:p-10 overflow-y-auto max-h-[60vh] custom-scrollbar space-y-8 relative z-10 w-full box-border">

                            {/* Status Section */}
                            <div className={`flex items-center gap-5 p-6 rounded-2xl border ${isResolved ? 'border-city-green/30 bg-city-green/5 drop-shadow-[0_0_15px_rgba(0,230,118,0.1)]' : 'border-city-orange/30 bg-city-orange/5 drop-shadow-[0_0_15px_rgba(245,158,11,0.1)]'}`}>
                                <div className={`flex items-center justify-center w-14 h-14 rounded-xl border bg-white dark:bg-[#0e0e0e] shadow-sm ${isResolved ? 'border-city-green text-city-green' : 'border-city-orange text-city-orange'}`}>
                                    {isResolved ? <CheckCircle className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current Sector Status</p>
                                    <p className={`font-heading text-2xl font-black uppercase tracking-tight ${isResolved ? 'text-city-green' : 'text-city-orange drop-shadow-sm'}`}>
                                        {report.Status}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                    <div className="p-1.5 rounded-md bg-city-blue/10">
                                        <Tag className="w-4 h-4 text-city-blue" />
                                    </div>
                                    Contextual Data Trace
                                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-white/10 to-transparent ml-2" />
                                </h3>
                                <div className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed bg-gray-50 dark:bg-white/5 p-6 md:p-8 rounded-2xl border border-gray-200/50 dark:border-white/5 text-base relative shadow-inner">
                                    <span className="absolute top-4 left-4 text-4xl text-gray-200 dark:text-white/10 font-heading">"</span>
                                    <p className="relative z-10 pl-4">{report.issue || report.Issue || "No detailed trace data provided."}</p>
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Location */}
                                <div className="p-6 bg-white/50 dark:bg-[#0e0e0e] rounded-2xl border border-gray-200/60 dark:border-white/5 shadow-sm hover:shadow-md dark:shadow-none transition-all group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-1.5 rounded-md bg-gray-100 dark:bg-white/5 group-hover:bg-city-red/10 transition-colors">
                                           <MapPin className="w-4 h-4 text-gray-400 group-hover:text-city-red transition-colors" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Location Vector</span>
                                    </div>
                                    <p className="text-sm font-black text-city-black dark:text-white uppercase drop-shadow-sm truncate">
                                        {report.Location || report.location || "Coordinate unknown"}
                                    </p>
                                </div>

                                {/* Date */}
                                <div className="p-6 bg-white/50 dark:bg-[#0e0e0e] rounded-2xl border border-gray-200/60 dark:border-white/5 shadow-sm hover:shadow-md dark:shadow-none transition-all group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-1.5 rounded-md bg-gray-100 dark:bg-white/5 group-hover:bg-city-blue/10 transition-colors">
                                            <Calendar className="w-4 h-4 text-gray-400 group-hover:text-city-blue transition-colors" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Time Logged</span>
                                    </div>
                                    <p className="text-sm font-black text-city-black dark:text-white uppercase drop-shadow-sm">
                                        {report.Date || "Unknown Timeline"}
                                    </p>
                                </div>
                            </div>

                            {/* Reporter Info */}
                            {report.Name && (
                                <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0e0e0e] dark:to-[#141414] rounded-2xl border border-gray-200/50 dark:border-white/5 shadow-inner">
                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#1a1a1a] shadow-sm border border-gray-200 dark:border-white/10 flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Initiated By Operative</span>
                                        <span className="text-base font-black text-city-black dark:text-white uppercase tracking-wider drop-shadow-sm">{report.Name}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 md:p-8 bg-gray-50/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-t border-gray-200/50 dark:border-white/10 flex flex-col-reverse sm:flex-row justify-end gap-4 relative z-10">
                            <button
                                onClick={onClose}
                                className="px-8 py-3.5 rounded-xl border border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-300 font-bold uppercase tracking-widest text-xs hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-center"
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={handleDownload}
                                className={`px-8 py-3.5 rounded-xl ${themeBg} text-white font-bold uppercase tracking-widest text-xs hover:shadow-lg transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5`}
                            >
                                <Download className="w-4 h-4" />
                                Export Secure Log
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReportDetailsModal;

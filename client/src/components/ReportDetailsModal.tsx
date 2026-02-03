import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Clock, AlertTriangle, CheckCircle, Tag, User, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { generatePDF } from '../utils/helpers';

interface ReportDetailsModalProps {
    report: any;
    isOpen: boolean;
    onClose: () => void;
}

const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({ report, isOpen, onClose }) => {
    if (!report) return null;

    const handleDownload = async () => {
        // Construct Image URL
        let imageSource = null;
        const rawImage = report.image || report.Image;

        if (rawImage) {
            if (rawImage.startsWith('http')) {
                // External URL - Try to proxy/use directly depending on CORS
                // For now, pass directly, helper handles it or fails gracefully
                imageSource = rawImage;
            } else {
                // Local Path (e.g. "uploads/xyz.jpg") -> Convert to Server URL
                // Assuming backend is at http://127.0.0.1:8000
                imageSource = `http://127.0.0.1:8000/${rawImage}`;
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

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white dark:bg-midnight-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">

                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50/50 dark:bg-midnight-900/50">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${report.Urgency === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            report.Urgency === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                            {report.Urgency} Priority
                                        </span>
                                        <span className="text-gray-400 dark:text-gray-500 text-sm font-mono">#{report.ID}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white leading-tight">
                                        {report.Category} Issue
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            {/* Scrollable Body */}
                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">

                                {/* Status Section */}
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                    <div className={`p-3 rounded-full ${report.Status === 'Resolved' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                        }`}>
                                        {report.Status === 'Resolved' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Current Status</p>
                                        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{report.Status}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-electric-blue-500" />
                                        Description
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-midnight-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                        {report.issue || report.Issue || "No detailed description provided."}
                                    </p>
                                </div>

                                {/* Metadata Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    {/* Location */}
                                    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 group hover:border-electric-blue-500 transition-colors">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin className="w-4 h-4 text-gray-400 group-hover:text-electric-blue-500" />
                                            <span className="text-xs font-bold text-gray-500 uppercase">Location</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                                            {report.Location || report.location || "Location not recorded"}
                                        </p>
                                    </div>

                                    {/* Date */}
                                    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 group hover:border-electric-blue-500 transition-colors">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="w-4 h-4 text-gray-400 group-hover:text-electric-blue-500" />
                                            <span className="text-xs font-bold text-gray-500 uppercase">Reported Date</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {report.Date || "Unknown Date"}
                                        </p>
                                    </div>
                                </div>

                                {/* Reporter Info (Optional) */}
                                {report.Name && (
                                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="p-2 rounded-full bg-gray-100 dark:bg-midnight-900">
                                            <User className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Reported by <span className="font-medium text-gray-700 dark:text-gray-300">{report.Name}</span>
                                        </span>
                                    </div>
                                )}

                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-midnight-900/50 flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="px-5 py-2.5 rounded-xl font-bold bg-electric-blue-600 hover:bg-electric-blue-700 text-white shadow-lg shadow-electric-blue-500/20 transition-all transform hover:scale-105 flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Report
                                </button>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ReportDetailsModal;

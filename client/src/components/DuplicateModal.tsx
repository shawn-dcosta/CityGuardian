import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ThumbsUp, X, ArrowRight, Loader } from 'lucide-react';

interface DuplicateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpvote: () => Promise<void>;
    originalReport: {
        id: string;
        issue: string;
        status?: string;
        location?: string;
    } | null;
}

const DuplicateModal: React.FC<DuplicateModalProps> = ({
    isOpen,
    onClose,
    onUpvote,
    originalReport
}) => {
    const [isUpvoting, setIsUpvoting] = useState(false);

    const handleUpvoteClick = async () => {
        setIsUpvoting(true);
        try {
            await onUpvote();
            // onClose is handled by parent on success
        } catch (error) {
            console.error("Upvote failed", error);
        } finally {
            setIsUpvoting(false);
        }
    };

    if (!isOpen || !originalReport) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-white/20"
                    >
                        {/* Header */}
                        <div className="bg-amber-500/10 p-6 pb-4 border-b border-amber-500/10">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/20 rounded-full text-amber-600 dark:text-amber-400">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                            Similar Report Found
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Wait! Someone beat you to it.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                It looks like this issue has already been reported nearby. Instead of creating a duplicate, you can <b>upvote</b> the existing one to increase its priority.
                            </p>

                            {/* Original Report Card */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-6">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                        Original Report
                                    </span>
                                    {originalReport.status && (
                                        <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold rounded-full border border-yellow-200 dark:border-yellow-800">
                                            {originalReport.status}
                                        </span>
                                    )}
                                </div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg mb-1">
                                    "{originalReport.issue}"
                                </h4>
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <span>📍 Nearby</span>
                                    {originalReport.id && <span>• ID: #{originalReport.id.slice(0, 6)}</span>}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <motion.button
                                    onClick={handleUpvoteClick}
                                    disabled={isUpvoting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all"
                                >
                                    {isUpvoting ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <ThumbsUp className="w-5 h-5" />
                                            Yes, Upvote This Report
                                        </>
                                    )}
                                </motion.button>

                                <button
                                    onClick={onClose} // In real app, might want a specific "force submit" handler
                                    className="w-full py-2.5 text-sm text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center justify-center gap-1"
                                >
                                    No, submit as new report
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DuplicateModal;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, X, ArrowRight, Loader } from 'lucide-react';

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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 xl:p-0 font-sans">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-city-surface-light/80 dark:bg-[#050505]/90 backdrop-blur-xl transition-opacity"
                    >
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay"></div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30, rotateX: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg bg-white/95 dark:bg-city-surface/95 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden rounded-3xl"
                    >
                        {/* Decorative Warning Lines */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-city-red drop-shadow-[0_0_15px_rgba(211,18,18,0.8)]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)' }} />

                         {/* Cinematic Light Accents */}
                         <div className="absolute top-0 right-0 w-64 h-64 bg-city-red/10 blur-[80px] rounded-full pointer-events-none" />

                        <div className="p-8 pb-6 border-b border-gray-200/50 dark:border-white/10 mt-2 relative z-10">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-xl border border-city-red bg-city-red/10 flex items-center justify-center text-city-red shadow-inner">
                                        <AlertTriangle className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-3xl font-black text-city-black dark:text-white uppercase tracking-tighter drop-shadow-sm">
                                            Tracing Collision
                                        </h3>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-city-red/80 drop-shadow-sm">
                                            Duplicate Vector Found
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 border border-gray-200 dark:border-white/10 text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 hover:text-city-black dark:hover:text-white transition-all active:scale-95"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 relative z-10">
                            <p className="text-sm font-bold text-gray-500 mb-6 uppercase tracking-wider leading-relaxed border-l-2 border-city-red/50 dark:border-city-red/30 pl-4 py-1">
                                An active trace matches your coordinates. Elevating priority on the existing vector is advised over a new log.
                            </p>

                            <div className="bg-white/50 dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-200 dark:border-white/5 mb-8 relative group shadow-inner">
                                <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl bg-city-orange/80 group-hover:bg-city-orange transition-colors" />
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-city-orange animate-pulse" />
                                        Original Trace 
                                    </span>
                                    {originalReport.status && (
                                        <span className="px-2 py-0.5 bg-city-orange/10 dark:bg-city-orange/20 border border-city-orange/30 text-city-orange text-[10px] font-black uppercase tracking-widest rounded shadow-sm">
                                            {originalReport.status}
                                        </span>
                                    )}
                                </div>
                                <h4 className="font-heading text-gray-800 dark:text-gray-200 text-xl font-bold mb-3 uppercase line-clamp-2">
                                    {originalReport.issue}
                                </h4>
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                                    <span className="text-city-blue drop-shadow-sm">LOC MATCHED</span>
                                    {originalReport.id && <span>SYS ID: {originalReport.id.slice(0, 6)}</span>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleUpvoteClick}
                                    disabled={isUpvoting}
                                    className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-city-black dark:bg-white text-white dark:text-city-black hover:shadow-lg font-black uppercase tracking-[0.2em] text-xs transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {isUpvoting ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <TrendingUp className="w-4 h-4" />
                                            Elevate Priority
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={onClose} 
                                    className="w-full py-4 rounded-xl border border-gray-300 dark:border-white/20 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:border-city-black dark:hover:border-white/50 hover:text-city-black dark:hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    Force New Log
                                    <ArrowRight className="w-3 h-3" />
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

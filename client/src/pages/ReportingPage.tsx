import React from 'react';
import { motion } from 'framer-motion';
import ReportingBento from '../components/ReportingBento';
import { useGeolocation } from '../hooks/useGeolocation';
import { type ToastItem } from '../components/ToastContainer';

interface ReportingPageProps {
    isDarkMode: boolean;
    toasts: ToastItem[];
    addToast: (message: string, type: ToastItem['type']) => void;
}

const ReportingPage: React.FC<ReportingPageProps> = ({ isDarkMode, addToast }) => {
    const location = useGeolocation();

    const handleReportSubmitted = () => {
        // Stay on success panel to allow user choice
    };

    return (
        <div className="min-h-screen relative font-sans pt-8 pb-16 bg-city-surface-light dark:bg-city-black overflow-hidden selection:bg-city-red/30 selection:text-city-red">
            {/* Cinematic Ambient Elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-city-blue/5 dark:bg-city-blue/10 blur-[150px] rounded-full pointer-events-none z-0 animate-pulse duration-[5000ms]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-city-red/5 dark:bg-city-red/10 blur-[150px] rounded-full pointer-events-none z-0" style={{ animation: "pulse 7s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />

            {/* Texture Overlays */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none mix-blend-overlay z-0"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 flex items-center justify-between"
                >
                    {/* Header elements removed for a cleaner, focused reporting experience */}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 100 }}
                >
                    <ReportingBento
                        isDarkMode={isDarkMode}
                        location={location}
                        addToast={addToast}
                        onReportSubmitted={handleReportSubmitted}
                    />
                </motion.div>
            </div>
        </div>
    );
};

export default ReportingPage;

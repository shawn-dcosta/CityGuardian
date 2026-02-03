import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReportingBento from '../components/ReportingBento';
import { useGeolocation } from '../hooks/useGeolocation';
import { type ToastItem } from '../components/ToastContainer';

interface ReportingPageProps {
    isDarkMode: boolean;
    toasts: ToastItem[];
    addToast: (message: string, type: ToastItem['type']) => void;
}

const ReportingPage: React.FC<ReportingPageProps> = ({ isDarkMode, addToast }) => {
    const navigate = useNavigate();
    const location = useGeolocation();

    const handleReportSubmitted = (data: any) => {
        // Redirect to dashboard after successful submission
        setTimeout(() => {
            navigate('/dashboard', { state: { newReport: data } });
        }, 1500);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-2"
            >
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-electric-blue-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Dashboard
                </button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <ReportingBento
                    isDarkMode={isDarkMode}
                    location={location}
                    addToast={addToast}
                    onReportSubmitted={handleReportSubmitted}
                />
            </motion.div>
        </div>
    );
};

export default ReportingPage;

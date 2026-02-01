import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReportingForm from '../components/ReportingForm';
import LocationMap from '../components/LocationMap';
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
                className="mb-6"
            >
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-electric-blue-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Dashboard
                </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                            Submit a New Report
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Found an issue? Snap a photo or describe it, and our AI will handle the rest.
                        </p>
                    </div>

                    <ReportingForm
                        location={location}
                        addToast={addToast}
                        onReportSubmitted={handleReportSubmitted}
                    />
                </motion.div>

                {/* Right Column: Map */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="h-full min-h-[400px]"
                >
                    <div className="sticky top-24">
                        <LocationMap location={location} isDarkMode={isDarkMode} />
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
                            <p className="font-semibold flex items-center gap-2">
                                📍 Location Accuracy
                            </p>
                            <p className="mt-1 opacity-80">
                                Please ensure the pin on the map matches the exact location of the issue. You can drag the pin to refine it.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ReportingPage;

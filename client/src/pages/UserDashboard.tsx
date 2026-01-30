import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Award, Activity, CheckCircle, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchReportsData } from '../services/dataService';

interface UserDashboardProps {
    isDarkMode: boolean;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ isDarkMode }) => {
    const { user } = useAuth();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        fixed: 0,
        pending: 0,
        points: 0 // Gamification points
    });

    useEffect(() => {
        const loadUserReports = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const allReports = await fetchReportsData();
                // Filter for current user's reports based on stored IDs
                const userReportIds = user.reportIds || [];
                const myReports = allReports.filter((r: any) => userReportIds.includes(r.ID));

                // Sort by date descending (assuming generic ID/date field, might need adjustment based on real data)
                myReports.sort((a: any, b: any) => parseInt(b.ID) - parseInt(a.ID));

                setReports(myReports);

                // Calculate Stats
                const fixed = myReports.filter((r: any) => r.Status === 'Resolved').length;
                const pending = myReports.filter((r: any) => r.Status !== 'Resolved').length;

                // Simple Gamification: 50 points per report, 100 bonus for resolved
                const points = (myReports.length * 50) + (fixed * 100);

                setStats({
                    total: myReports.length,
                    fixed,
                    pending,
                    points
                });

            } catch (err) {
                console.error("Failed to load reports", err);
            } finally {
                setLoading(false);
            }
        };

        loadUserReports();
    }, [user]);

    const getStatusStep = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 1;
            case 'verified': return 2;
            case 'in-progress': return 3;
            case 'resolved': return 4;
            default: return 1;
        }
    };

    return (
        <div className="container mx-auto px-4 pt-6 pb-12">

            {/* Header with Gamification */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        Welcome back, <span className="text-electric-blue-600">{user?.name || 'Citizen'}</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Here's your impact on the community.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                        <Award className="w-5 h-5" />
                        <span className="font-bold">{stats.points} Impact Points</span>
                    </div>
                    <Link
                        to="/report"
                        className="bg-electric-blue-600 hover:bg-electric-blue-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1"
                    >
                        <Plus className="w-5 h-5" />
                        New Report
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4"
                >
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                        <Activity className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Total Reports</p>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</h3>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4"
                >
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl">
                        <Clock className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Pending / In Progress</p>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.pending}</h3>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4"
                >
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Resolved Issues</p>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.fixed}</h3>
                    </div>
                </motion.div>
            </div>

            {/* Reports List with Visual Tracker */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-electric-blue-500" />
                    Your Reports History
                </h2>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-electric-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading your impact history...</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No reports yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't submitted any issues yet. Be the first to improve your area!</p>
                        <Link to="/report" className="px-6 py-2 bg-electric-blue-600 text-white rounded-lg hover:bg-electric-blue-700 transition-colors">
                            Submit First Report
                        </Link>
                    </div>
                ) : (
                    reports.map((report, index) => {
                        const currentStep = getStatusStep(report.Status || 'pending');

                        return (
                            <motion.div
                                key={report.ID || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${report.Urgency === 'high' ? 'bg-red-100 text-red-600' :
                                                        report.Urgency === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {report.Urgency} Priority
                                                </span>
                                                <span className="text-gray-400 text-sm">#{report.ID}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                                                {report.Category || 'General Issue'} - <span className="text-gray-500 dark:text-gray-400 font-normal">{report.issue || 'No description provided'}</span>
                                            </h3>
                                            <p className="text-sm text-gray-400">{report.Date}</p>
                                        </div>
                                    </div>

                                    {/* Visual Status Tracker */}
                                    <div className="relative">
                                        {/* Progress Bar Background */}
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700 -translate-y-1/2 rounded-full z-0" />

                                        {/* Completed Progress Bar */}
                                        <div
                                            className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 rounded-full z-0 transition-all duration-1000"
                                            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                                        />

                                        <div className="relative z-10 flex justify-between">
                                            {['Received', 'Verified', 'Dispatch', 'Resolved'].map((step, i) => {
                                                const stepNum = i + 1;
                                                const isActive = stepNum <= currentStep;
                                                const isCompleted = stepNum < currentStep;

                                                return (
                                                    <div key={step} className="flex flex-col items-center">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive
                                                                ? 'bg-green-500 border-green-500 text-white'
                                                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                                                            }`}>
                                                            {isCompleted ? <CheckCircle className="w-5 h-5" /> : <span className="text-xs font-bold">{stepNum}</span>}
                                                        </div>
                                                        <span className={`mt-2 text-xs font-medium transition-colors ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                                                            }`}>
                                                            {step}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Last update: {report.lastUpdated || 'Just now'}
                                    </span>
                                    <button className="text-electric-blue-600 hover:text-electric-blue-700 font-medium">
                                        View Details &rarr;
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default UserDashboard;

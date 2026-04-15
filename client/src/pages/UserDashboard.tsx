import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Activity, CheckCircle, Clock, MapPin, AlertTriangle, ArrowRight, X, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchReportsData } from '../services/dataService';

interface UserDashboardProps {
    isDarkMode: boolean;
}

const UserDashboard: React.FC<UserDashboardProps> = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        fixed: 0,
        pending: 0
    });
    const [selectedReport, setSelectedReport] = useState<any>(null);

    const location = useLocation();

    useEffect(() => {
        const loadUserReports = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const allReports = await fetchReportsData();
                const userReportIds = user.reportIds || [];
                const myReports = allReports.filter((r: any) => userReportIds.includes(r.ID));

                const newReport = (location.state as any)?.newReport;
                if (newReport && !myReports.find((r: any) => r.ID === newReport.id)) {
                    const optimisticReport = {
                        ID: newReport.id,
                        Status: 'Pending',
                        Category: newReport.category,
                        Urgency: newReport.urgency,
                        Issue: newReport.issue,
                        Date: newReport.date,
                        Location: newReport.location,
                        lat: 0,
                        lon: 0
                    };
                    myReports.unshift(optimisticReport);
                }

                myReports.sort((a: any, b: any) => parseInt(b.ID) - parseInt(a.ID));

                setReports(myReports);

                const fixed = myReports.filter((r: any) => r.Status === 'Resolved').length;
                const pending = myReports.filter((r: any) => r.Status !== 'Resolved').length;

                setStats({
                    total: myReports.length,
                    fixed,
                    pending
                });

            } catch (err) {
                console.error("Failed to load reports", err);
            } finally {
                setLoading(false);
            }
        };

        loadUserReports();
    }, [user, location.state]);

    const getStatusStep = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 1;
            case 'verified': return 2;
            case 'in-progress': return 3;
            case 'dispatch': return 3;
            case 'resolved': return 4;
            default: return 1;
        }
    };

    return (
        <div className="container mx-auto px-4 pt-10 pb-20 relative font-sans">
            {/* Cinematic Ambient Elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-city-blue/5 dark:bg-city-blue/10 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse duration-[5000ms]" />
            <div className="absolute top-[40%] left-[-10%] w-[600px] h-[600px] bg-city-red/5 dark:bg-city-red/10 blur-[150px] rounded-full pointer-events-none -z-10" style={{ animation: "pulse 7s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            
            {/* Command Center Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-14 gap-6 relative z-10 border-b border-gray-200/50 dark:border-white/10 pb-8 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full mb-4 shadow-inner">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-city-green opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-city-green"></span>
                        </span>
                        <p className="text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
                            Operative: <span className="text-city-blue">{user?.name || 'Unknown'}</span> // Clearance: Citizen
                        </p>
                    </div>
                    <h1 className="font-heading text-5xl md:text-6xl font-black text-city-black dark:text-white uppercase tracking-tighter mb-2 drop-shadow-md">
                        Command <span className="text-transparent bg-clip-text bg-gradient-to-br from-city-blue to-blue-400 dark:from-city-blue dark:to-blue-200">Center</span>
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Link
                        to="/report"
                        className="group relative px-8 py-4 bg-city-blue dark:bg-white text-white dark:text-city-black rounded-xl font-black uppercase tracking-widest overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95 flex items-center justify-center gap-3 backdrop-blur-md"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <Target className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                            Init Report
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-city-blue dark:from-gray-200 dark:to-white transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                    </Link>
                </motion.div>
            </div>

            {/* Stark Metrics Suite */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="p-8 rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-city-surface/80 backdrop-blur-xl relative overflow-hidden group hover:border-city-blue/30 dark:hover:border-city-blue/30 transition-colors shadow-lg shadow-gray-200/20 dark:shadow-none"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-city-blue/10 dark:bg-city-blue/20 blur-[30px] rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                    <div className="absolute top-0 right-0 p-6 opacity-10 dark:opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                        <Activity className="w-20 h-20 text-city-blue" />
                    </div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="p-2.5 rounded-lg bg-city-blue/10 border border-city-blue/20 text-city-blue">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase">Total Ops</span>
                    </div>
                    <h3 className="font-heading text-6xl font-black text-city-black dark:text-white relative z-10 drop-shadow-sm">{stats.total}</h3>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="p-8 rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-city-surface/80 backdrop-blur-xl relative overflow-hidden group hover:border-city-orange/30 dark:hover:border-city-orange/30 transition-colors shadow-lg shadow-gray-200/20 dark:shadow-none"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-city-orange/10 dark:bg-city-orange/20 blur-[30px] rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                    <div className="absolute top-0 right-0 p-6 opacity-10 dark:opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                        <Clock className="w-20 h-20 text-city-orange" />
                    </div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="p-2.5 rounded-lg bg-city-orange/10 border border-city-orange/20 text-city-orange">
                            <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase">Active Ops</span>
                    </div>
                    <h3 className="font-heading text-6xl font-black text-city-black dark:text-white relative z-10 drop-shadow-sm">{stats.pending}</h3>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="p-8 rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-city-surface/80 backdrop-blur-xl relative overflow-hidden group hover:border-city-green/30 dark:hover:border-city-green/30 transition-colors shadow-lg shadow-gray-200/20 dark:shadow-none"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-city-green/10 dark:bg-city-green/20 blur-[30px] rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                    <div className="absolute top-0 right-0 p-6 opacity-10 dark:opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                        <CheckCircle className="w-20 h-20 text-city-green" />
                    </div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="p-2.5 rounded-lg bg-city-green/10 border border-city-green/20 text-city-green">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase">Neutralized</span>
                    </div>
                    <h3 className="font-heading text-6xl font-black text-city-black dark:text-white relative z-10 drop-shadow-sm">{stats.fixed}</h3>
                </motion.div>
            </div>

            {/* Main Manifest grid */}
            <div className="space-y-6 max-w-4xl relative z-10">
                <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-white/10 pb-4 mb-8">
                    <h2 className="text-sm font-bold text-city-black dark:text-gray-300 uppercase tracking-[0.2em] flex items-center gap-3">
                        <div className="p-1.5 bg-city-red/10 rounded-md">
                            <MapPin className="w-4 h-4 text-city-red" />
                        </div>
                        Operation Log Manifest
                    </h2>
                </div>

                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-gray-100 dark:bg-white/5 animate-pulse rounded-2xl border border-gray-200 dark:border-white/5 backdrop-blur-sm"></div>
                        ))}
                    </div>
                ) : reports.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24 bg-white/40 dark:bg-city-surface/40 backdrop-blur-md rounded-3xl border border-dashed border-gray-300 dark:border-white/20"
                    >
                        <div className="inline-flex p-5 rounded-2xl bg-city-red/5 border border-city-red/10 mb-6 group hover:bg-city-red/10 transition-colors">
                            <AlertTriangle className="w-12 h-12 text-city-red/60 group-hover:text-city-red transition-colors" />
                        </div>
                        <h3 className="font-heading text-2xl font-black text-city-black dark:text-white uppercase tracking-tight mb-3">No Active Records</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-10 max-w-sm mx-auto leading-relaxed">Deploy your first report to initiate network node tracking and system trace.</p>
                        <Link to="/report" className="px-10 py-4 bg-city-black dark:bg-white text-white dark:text-city-black text-sm font-black rounded-xl uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-1 active:scale-95 inline-flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Init Operations
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid gap-6">
                    {reports.map((report, index) => {
                        const currentStep = getStatusStep(report.Status || 'pending');
                        const isHighPriority = report.Urgency?.toLowerCase() === 'high';
                        const isResolved = currentStep === 4;

                        // Calculate status color
                        let statusColor = 'bg-city-blue/90';
                        let borderColor = 'border-l-city-blue/50 focus:border-l-city-blue';
                        let badgeBg = 'bg-city-blue/10 dark:bg-city-blue/20 text-city-blue border-city-blue/20';
                        
                        if (isResolved) {
                            statusColor = 'bg-city-green/90';
                            borderColor = 'border-l-city-green/50 focus:border-l-city-green';
                            badgeBg = 'bg-city-green/10 dark:bg-city-green/20 text-city-green border-city-green/20';
                        } else if (isHighPriority) {
                            statusColor = 'bg-city-red/90';
                            borderColor = 'border-l-city-red/50 focus:border-l-city-red text-city-red';
                            badgeBg = 'bg-city-red border-city-red text-white'; // High priority gets stark colors
                        } else if (report.Urgency?.toLowerCase() === 'medium') {
                            badgeBg = 'bg-city-orange/10 dark:bg-city-orange/20 text-city-orange border-city-orange/20';
                        }

                        return (
                            <motion.div
                                key={report.ID || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 + 0.3 }}
                                className={`bg-white/80 dark:bg-city-surface/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-lg dark:shadow-none group cursor-pointer transition-all duration-300 border-l-[6px] ${borderColor} hover:-translate-y-1`}
                                onClick={() => setSelectedReport(report)}
                            >
                                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-black/5 dark:from-white/5 to-transparent skew-x-12 translate-x-20 group-hover:translate-x-10 transition-transform duration-700 opacity-0 group-hover:opacity-100" />
                                    
                                    <div className="w-full md:w-[45%] relative z-10">
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <span className="px-2.5 py-1 bg-gray-100 dark:bg-white/5 rounded-md border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-500 tracking-widest shadow-inner">
                                                ID:{report.ID}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest shadow-inner ${badgeBg}`}>
                                                {report.Urgency} PRTY
                                            </span>
                                        </div>
                                        <h3 className="font-heading text-2xl font-black text-city-black dark:text-white uppercase tracking-tight mb-2 drop-shadow-sm">
                                            {report.Category || 'ANOMALY'}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium truncate w-full decoration-gray-300 dark:decoration-gray-600 underline-offset-4 group-hover:underline">
                                            {report.issue || report.Issue || 'Awaiting classification...'}
                                        </p>
                                    </div>

                                    <div className="w-full md:w-[50%] mt-2 md:mt-0 relative z-10">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">
                                            <span className={currentStep >= 1 ? 'text-city-black dark:text-white drop-shadow-sm' : ''}>Logged</span>
                                            <span className={currentStep >= 2 ? 'text-city-black dark:text-white drop-shadow-sm' : ''}>Verified</span>
                                            <span className={currentStep >= 3 ? 'text-city-black dark:text-white drop-shadow-sm' : ''}>Active</span>
                                            <span className={currentStep >= 4 ? 'text-city-green drop-shadow-[0_0_8px_rgba(0,230,118,0.5)]' : ''}>Neutral</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 h-3 rounded-full relative overflow-hidden shadow-inner">
                                            {/* Stepped progress indicators */}
                                            <div className="absolute top-0 bottom-0 left-1/3 w-px bg-gray-200 dark:bg-white/10 z-10" />
                                            <div className="absolute top-0 bottom-0 left-2/3 w-px bg-gray-200 dark:bg-white/10 z-10" />
                                            
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                                                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                                className={`absolute inset-y-0 left-0 rounded-full ${statusColor} backdrop-blur-sm`}
                                            />
                                            {/* Glow effect on progress bar */}
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                                                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                                className={`absolute top-0 bottom-0 left-0 bg-white/30 blur-[4px]`}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Action Indicator */}
                                    <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 group-hover:bg-city-blue group-hover:border-city-blue group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-300 relative z-10">
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                    </div>
                )}
            </div>

            {/* Immersive Modal View */}
            <AnimatePresence>
                {selectedReport && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-city-surface-light/80 dark:bg-[#050505]/90 backdrop-blur-xl font-sans" 
                        onClick={() => setSelectedReport(null)}
                    >
                        {/* Film grain inside modal */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] pointer-events-none mix-blend-overlay"></div>

                        <motion.div
                            initial={{ scale: 0.95, y: 30, rotateX: 5 }}
                            animate={{ scale: 1, y: 0, rotateX: 0 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white/95 dark:bg-city-surface/95 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 w-full max-w-3xl relative overflow-hidden rounded-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative Top Bar reflecting status */}
                            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                                getStatusStep(selectedReport.Status) === 4 ? 'bg-city-green shadow-[0_0_20px_rgba(0,230,118,0.6)]' : 
                                selectedReport.Urgency?.toLowerCase() === 'high' ? 'bg-city-red shadow-[0_0_20px_rgba(211,18,18,0.6)]' : 'bg-city-blue shadow-[0_0_20px_rgba(37,99,235,0.6)]'
                            }`} />

                            {/* Cinematic Light Accents */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-city-blue/5 dark:bg-city-blue/10 blur-[80px] rounded-full pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-city-blue/5 dark:bg-city-blue/10 blur-[80px] rounded-full pointer-events-none" />
                            
                            <div className="p-8 md:p-12 relative z-10">
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="absolute top-6 right-6 w-11 h-11 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 hover:scale-105 active:scale-95 transition-all text-gray-500 dark:text-gray-400 group"
                                >
                                    <X className="w-5 h-5 group-hover:text-city-black dark:group-hover:text-white transition-colors" />
                                </button>

                                <div className="mb-10 pr-12">
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="px-3 py-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                Log ID: {selectedReport.ID}
                                            </span>
                                            <span className={`w-2 h-2 rounded-full ${getStatusStep(selectedReport.Status) === 4 ? 'bg-city-green animate-pulse' : 'bg-city-red animate-pulse'}`} />
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest shadow-inner ${
                                            selectedReport.Urgency?.toLowerCase() === 'high' ? 'bg-city-red border-city-red text-white' :
                                            selectedReport.Urgency?.toLowerCase() === 'medium' ? 'bg-city-orange/10 dark:bg-city-orange/20 border-city-orange/20 text-city-orange' :
                                            'bg-city-blue/10 dark:bg-city-blue/20 border-city-blue/20 text-city-blue'
                                        }`}>
                                            {selectedReport.Urgency || 'STD'} PRTY
                                        </span>
                                    </div>
                                    
                                    <h2 className="font-heading text-4xl md:text-5xl font-black text-city-black dark:text-white uppercase tracking-tighter mb-5 leading-[0.9] drop-shadow-sm">
                                        {selectedReport.Category || 'Anomaly Detected'}
                                    </h2>
                                    
                                    <p className="text-lg text-gray-700 dark:text-gray-300 font-medium leading-relaxed bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/5 relative shadow-inner">
                                        <span className="absolute top-4 left-4 text-4xl text-gray-200 dark:text-white/10 font-heading">"</span>
                                        <span className="relative z-10 pl-6 block text-gray-600 dark:text-gray-300">
                                            {selectedReport.issue || selectedReport.Issue || 'Trace context unavailable. Awaiting further analysis.'}
                                        </span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                                    <div className="bg-gray-50 dark:bg-[#0e0e0e] p-6 rounded-2xl border border-gray-200/60 dark:border-white/5 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Timeframe Est.</h4>
                                        </div>
                                        <span className="text-sm font-black text-city-black dark:text-white uppercase tracking-wider block mt-1">
                                            {selectedReport.Urgency?.toLowerCase() === 'high' ? 'IMMEDIATE // 24H' : 'STANDARD // 3-7D'}
                                        </span>
                                    </div>
                                    
                                    <div className="bg-gray-50 dark:bg-[#0e0e0e] p-6 rounded-2xl border border-gray-200/60 dark:border-white/5 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Activity className="w-4 h-4 text-gray-400" />
                                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sector Focus</h4>
                                        </div>
                                        <span className="text-sm font-black text-city-black dark:text-white uppercase tracking-wider block mt-1">
                                            {selectedReport.Category || 'MUNICIPAL CORE'}
                                        </span>
                                    </div>
                                    
                                    <div className="md:col-span-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0e0e0e] dark:to-[#141414] p-6 rounded-2xl border border-gray-200/60 dark:border-white/5 shadow-inner">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-1.5 bg-city-red/10 rounded-md">
                                                <MapPin className="w-4 h-4 text-city-red" />
                                            </div>
                                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Coordinates</h4>
                                        </div>
                                        <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 p-4 rounded-xl flex items-center justify-between group/link shadow-sm">
                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-300 truncate max-w-[80%]">
                                                {selectedReport.Location || 'Scan Coordinates pending...'}
                                            </span>
                                            <a
                                                href={`https://www.google.com/maps?q=${selectedReport.Location}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-4 py-2 bg-city-blue/10 dark:bg-city-blue/20 text-city-blue hover:bg-city-blue hover:text-white transition-colors rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                                            >
                                                Open Maps <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserDashboard;

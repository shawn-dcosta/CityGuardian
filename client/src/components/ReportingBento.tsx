import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader2, CheckCircle, AlertTriangle, Target, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import LocationMap from './LocationMap';
import DuplicateModal from './DuplicateModal';
import { generatePDF } from '../utils/helpers';
import { AUTH_API_URL, AI_API_URL } from '../config';

const API_BASE_URL = AI_API_URL;

interface ReportingBentoProps {
    isDarkMode: boolean;
    location: any; // Passed from useGeolocation
    addToast: (msg: string, type: any) => void;
    onReportSubmitted?: (data: any) => void;
}

const ReportingBento: React.FC<ReportingBentoProps> = ({ isDarkMode, location, addToast, onReportSubmitted }) => {
    const { user, isAuthenticated, token, refreshUser } = useAuth();
    const [step, setStep] = useState<'capture' | 'analyzing' | 'verify' | 'submitted'>('capture');

    // Data State
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [urgency, setUrgency] = useState<string>('medium');

    // UI State
    const [loading, setLoading] = useState(false);
    const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
    const [duplicateData, setDuplicateData] = useState<any>(null);
    const [manualAddress, setManualAddress] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // AI Analysis Handler
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setStep('analyzing');
            await analyzeImage(file);
        }
    };

    const analyzeImage = async (file: File) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post(`${API_BASE_URL}/analyze-image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const data = res.data;
            if (data.valid) {
                // Backend now sends explicit 'category' and 'urgency'
                setCategory(data.category || data.suggestion || 'General');
                setDescription(data.description || '');
                setUrgency(data.urgency || 'medium');
                setManualAddress(location.address || '');
                setStep('verify');
                addToast('AI Analysis Complete', 'success');
            } else {
                addToast(data.suggestion || 'Image unclear, please verify.', 'warning');
                setCategory('Other');
                setDescription('');
                setStep('verify'); // Allow manual entry even if AI fails slightly
            }
        } catch (error) {
            console.error("Analysis failed", error);
            addToast('AI Analysis Failed. Please enter details manually.', 'error');
            setStep('verify'); // Fallback to manual
        } finally {
            setLoading(false);
        }
    };

    const handleUpvote = async () => {
        if (!duplicateData?.id) return;
        const userEmail = user?.email || 'anonymous@example.com';

        try {
            await axios.post(`${API_BASE_URL}/upvote-report`, {
                report_id: duplicateData.id,
                user_email: userEmail
            });
            addToast("Report upvoted & subscribed!", "success");
            setDuplicateModalOpen(false);
            setStep('submitted'); // Treat upvote as "submission"
        } catch (error) {
            addToast("Failed to upvote report", "error");
        }
    };

    const handleSubmit = async () => {
        if (!location.latitude || !location.longitude) {
            addToast('Location missing. Please wait for map to load.', 'warning');
            return;
        }

        setLoading(true);
        const submitData = new FormData();
        submitData.append('name', user?.name || 'Anonymous');
        submitData.append('email', user?.email || 'no-email@provided.com');
        submitData.append('complaint', description);
        submitData.append('latitude', location.latitude.toString());
        submitData.append('longitude', location.longitude.toString());
        submitData.append('address', manualAddress || location.address || 'Unknown Location');

        if (image) submitData.append('image', image);
        submitData.append('category', category); // Send verified category
        submitData.append('urgency', urgency);   // Send verified urgency

        try {
            const response = await axios.post(`${API_BASE_URL}/send-report`, submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.status === 'success') {
                // Link to user if logged in
                if (isAuthenticated && user && token && response.data.id) {
                    try {
                        await axios.put(`${AUTH_API_URL}/auth/add-report`, { reportId: response.data.id }, {
                            headers: { 'x-auth-token': token }
                        });
                        await refreshUser();
                    } catch (err) { console.error("Link user failed", err); }
                }

                setStep('submitted');
                if (onReportSubmitted) onReportSubmitted(response.data);

                // Generate Receipt
                await generatePDF(
                    user?.name || 'Anonymous',
                    description,
                    response.data.department || 'General',
                    location.address,
                    image
                );
            }
        } catch (error: any) {
            if (error.response?.status === 409) {
                const dup = error.response.data;
                setDuplicateData({
                    id: dup.original_report_id,
                    issue: dup.original_issue,
                    status: 'Pending',
                    location: location.address
                });
                setDuplicateModalOpen(true);
            } else {
                console.error("Submission Error Details:", error);
                addToast(`Submission failed: ${error.message || 'Unknown Error'}`, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto min-h-[600px] p-4 md:p-6 font-sans relative">
            {/* Ambient Background Blur for the whole bento */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-city-blue/5 dark:bg-city-blue/10 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse duration-[5000ms]"></div>
            
            <AnimatePresence mode="wait">

                {/* STEP 1: CAPTURE */}
                {step === 'capture' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="flex flex-col items-center justify-center min-h-[500px] bg-white/40 dark:bg-city-surface/40 backdrop-blur-2xl rounded-[2rem] border border-dashed border-gray-300 dark:border-white/10 hover:border-city-blue dark:hover:border-city-blue transition-all group shadow-2xl relative overflow-hidden p-8"
                    >
                        {/* Cinematic overlay grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

                        <div className="absolute inset-0 bg-gradient-to-tr from-city-blue/5 dark:from-city-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <input
                            type="file"
                            ref={cameraInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                        />
                        
                        <div className="w-28 h-28 rounded-full bg-white dark:bg-city-black border border-gray-200 dark:border-white/10 shadow-[0_0_40px_rgba(37,99,235,0.1)] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(37,99,235,0.2)] transition-all duration-500 relative z-10">
                            <Camera className="w-12 h-12 text-city-blue transition-colors group-hover:rotate-12 duration-500" />
                        </div>
                        
                        <h2 className="font-heading text-4xl md:text-5xl font-black text-city-black dark:text-white uppercase tracking-tighter mb-4 text-center drop-shadow-sm relative z-10">
                            Snap <span className="text-transparent bg-clip-text bg-gradient-to-br from-city-blue to-blue-400">&</span> Fix
                        </h2>
                        
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mb-10 max-w-sm text-center px-4 relative z-10">
                            Log a visual anomaly. Core AI will parse coordinates and context automatically.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full px-4 max-w-md">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 py-4 bg-white dark:bg-city-surface border border-gray-200 dark:border-white/10 text-city-black dark:text-white font-black uppercase tracking-widest text-sm hover:shadow-lg rounded-2xl transition-all flex items-center justify-center gap-2 hover:-translate-y-1"
                            >
                                <Upload className="w-4 h-4" />
                                Gallery
                            </button>
                            <button 
                                onClick={() => cameraInputRef.current?.click()}
                                className="flex-1 py-4 bg-city-blue text-white font-black uppercase tracking-[0.2em] text-sm hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] rounded-2xl transition-all flex items-center justify-center gap-2 hover:-translate-y-1"
                            >
                                <Camera className="w-4 h-4" />
                                Capture
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: ANALYZING */}
                {step === 'analyzing' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center min-h-[600px] py-16 text-center bg-white/40 dark:bg-city-surface/40 backdrop-blur-2xl rounded-[2rem] border border-gray-200/50 dark:border-white/10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>

                        <div className="relative w-full max-w-2xl aspect-square md:aspect-video mb-12 overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 rounded-2xl bg-city-black group">
                            <motion.div
                                className="absolute inset-0 border-b-[4px] border-city-blue z-30 bg-city-blue/10"
                                animate={{ top: ["-5%", "105%", "-5%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                            {/* HUD Overlays - Simplified Rectangular HUD */}
                            <div className="absolute inset-0 border-8 border-city-black/40 z-20 pointer-events-none" />
                            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(37,99,235,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.1)_1px,transparent_1px)] bg-[size:20px_20px] z-10 opacity-30 px-px"></div>
                            
                            {/* Corner Accents */}
                            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-city-blue z-30 opacity-60" />
                            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-city-blue z-30 opacity-60" />
                            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-city-blue z-30 opacity-60" />
                            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-city-blue z-30 opacity-60" />

                            <img src={imagePreview!} alt="Analyzing" className="w-full h-full object-cover opacity-60 filter contrast-125 grayscale-[50%]" />
                        </div>

                        <h2 className="font-heading text-3xl md:text-4xl font-black text-city-black dark:text-white uppercase tracking-tighter mb-4 drop-shadow-sm">
                            Executing Trace
                        </h2>
                        <div className="px-6 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full shadow-inner flex items-center justify-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin text-city-blue" />
                            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                                Extracting coordinate and contextual vectors
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: VERIFY */}
                {step === 'verify' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center"
                    >
                        {/* LEFT: Contextual Validation */}
                        <div className="space-y-6 flex flex-col h-fit bg-white/40 dark:bg-city-surface/40 backdrop-blur-2xl rounded-[2rem] border border-gray-200/50 dark:border-white/10 px-6 pb-6 pt-2 shadow-2xl relative overflow-hidden">
                             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none -z-10"></div>
                            
                            <div className="relative h-[250px] overflow-hidden rounded-2xl shadow-inner border border-gray-200 dark:border-white/10 group">
                                <img src={imagePreview!} alt="Report" className="w-full h-full object-cover filter contrast-125 group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-city-black/90 via-city-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-4 text-white z-10 flex flex-col items-start">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-4 h-4 text-city-orange animate-pulse" />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">Threat Level</p>
                                    </div>
                                    <span className={`inline-flex px-3 py-1 text-xs font-black uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] border ${
                                        urgency === 'high' ? 'bg-city-red/90 border-city-red text-white' : 'bg-city-orange/90 border-city-orange text-white'
                                    }`}>
                                        {urgency}
                                    </span>
                                </div>
                            </div>

                            {/* Integrated Map Verification */}
                            <div className="h-[500px] border border-gray-200 dark:border-white/10 rounded-2xl relative overflow-hidden bg-white dark:bg-[#0a0a0a] shadow-inner p-6">
                                <LocationMap 
                                    location={location} 
                                    isDarkMode={isDarkMode} 
                                    editableAddress={manualAddress}
                                    onAddressChange={setManualAddress}
                                />
                            </div>
                        </div>

                        {/* RIGHT: Form Data */}
                        <div className="bg-white/60 dark:bg-city-surface/60 backdrop-blur-2xl p-8 rounded-[2rem] border border-gray-200/50 dark:border-white/10 shadow-2xl flex flex-col h-fit self-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/10 dark:from-white/5 dark:to-transparent pointer-events-none -z-10"></div>
                            
                            <div className="flex items-center gap-3 mb-8 border-b border-gray-200 dark:border-white/10 pb-6 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-city-green/10 border border-city-green/20 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-city-green" />
                                </div>
                                <div>
                                    <h2 className="font-heading text-2xl font-black uppercase tracking-tighter text-city-black dark:text-white leading-none">
                                        Verify Metrics
                                    </h2>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Cross-check AI analysis</p>
                                </div>
                            </div>

                            <div className="space-y-6 flex-1 relative z-10">
                                <div className="group">
                                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Zap className="w-3 h-3 text-city-blue" />
                                        Issue Vector
                                    </label>
                                    <input
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl font-bold uppercase tracking-wide text-sm text-city-black dark:text-white focus:border-city-blue focus:ring-2 focus:ring-city-blue/20 outline-none transition-all shadow-inner"
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Target className="w-3 h-3 text-city-blue" />
                                        Contextual Data
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl font-medium text-base text-city-black dark:text-white focus:border-city-blue focus:ring-2 focus:ring-city-blue/20 outline-none min-h-[120px] resize-none transition-all shadow-inner"
                                    />
                                </div>

                                <div className="mt-auto pt-10 flex flex-row items-center justify-center gap-4 px-2">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-1 max-w-[180px] py-4 rounded-xl bg-city-green text-white uppercase font-black tracking-widest text-base transition-all hover:bg-city-green/90 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Transmitting...
                                            </>
                                        ) : (
                                            'Submit Report'
                                        )}
                                    </button>
                                    <button
                                        onClick={() => { setStep('capture'); setImage(null); }}
                                        className="flex-1 max-w-[180px] py-4 rounded-xl bg-city-red text-white uppercase font-black tracking-widest text-base hover:bg-city-red/90 transition-all shadow-md active:scale-95 flex items-center justify-center"
                                    >
                                        Abort
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 4: SUBMITTED */}
                {step === 'submitted' && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center min-h-[500px] text-center bg-city-green/5 dark:bg-city-green/10 backdrop-blur-2xl rounded-[2rem] border border-city-green/30 shadow-[0_0_40px_rgba(0,230,118,0.1)] p-8 relative overflow-hidden"
                    >
                         {/* Ambient glow */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-city-green/20 blur-[100px] rounded-full pointer-events-none -z-10"></div>
                         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none z-0"></div>

                        <div className="w-24 h-24 rounded-full bg-city-green/20 border border-city-green/40 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(0,230,118,0.3)] relative z-10">
                            <CheckCircle className="w-12 h-12 text-city-green" />
                        </div>
                        <h2 className="font-heading text-4xl md:text-5xl font-black text-city-black dark:text-white uppercase tracking-tighter mb-4 drop-shadow-sm relative z-10">Report Submitted</h2>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mb-10 text-center max-w-sm relative z-10">
                            Your report has been successfully sent. Authorities will review it shortly.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full sm:w-auto">
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                className="px-8 py-4 bg-white dark:bg-city-surface border border-gray-200 dark:border-white/10 text-city-black dark:text-white font-bold uppercase tracking-widest text-sm hover:shadow-lg rounded-2xl transition-all shadow-sm"
                            >
                                Track Issue
                            </button>
                            <button
                                onClick={() => {
                                    setStep('capture');
                                    setImage(null);
                                    setImagePreview(null);
                                }}
                                className="px-8 py-4 bg-city-green text-white font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_20px_rgba(0,230,118,0.4)] hover:-translate-y-1 rounded-2xl transition-all"
                            >
                                New Report
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <DuplicateModal
                isOpen={duplicateModalOpen}
                onClose={() => setDuplicateModalOpen(false)}
                originalReport={duplicateData}
                onUpvote={handleUpvote}
            />
        </div>
    );
};

export default ReportingBento;

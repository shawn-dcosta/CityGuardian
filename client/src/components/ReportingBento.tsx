import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, CheckCircle, MapPin, AlertTriangle, Mic, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import LocationMap from './LocationMap';
import DuplicateModal from './DuplicateModal';
import { generatePDF } from '../utils/helpers';
import { AUTH_API_URL } from '../config';

const API_BASE_URL = 'http://127.0.0.1:8000';

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

    const fileInputRef = useRef<HTMLInputElement>(null);

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
        submitData.append('address', location.address || 'Unknown Location');

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
                generatePDF(
                    user?.name || 'Anonymous',
                    description,
                    response.data.department || 'General',
                    location.address
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
        <div className="w-full max-w-5xl mx-auto min-h-[600px] p-4 md:p-6">
            <AnimatePresence mode="wait">

                {/* STEP 1: CAPTURE */}
                {step === 'capture' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center justify-center h-[500px] glass-card rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-electric-blue-500 transition-all cursor-pointer group shadow-2xl relative overflow-hidden"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-electric-blue-500/5 to-purple-500/5 group-hover:opacity-100 transition-opacity" />

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <div className="w-28 h-28 rounded-full bg-electric-blue-100 dark:bg-electric-blue-900/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                            <Camera className="w-12 h-12 text-electric-blue-600" />
                        </div>
                        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-3">Snap & Fix</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-md text-center px-4">
                            Take a photo of any civic issue. Our AI will analyze the context and location instantly.
                        </p>
                        <button className="px-8 py-4 bg-white dark:bg-midnight-800 rounded-2xl font-bold shadow-lg border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-3 group-hover:bg-gray-50 dark:group-hover:bg-midnight-700 transition-colors">
                            <Upload className="w-5 h-5" />
                            Upload Evidence
                        </button>
                    </motion.div>
                )}

                {/* STEP 2: ANALYZING */}
                {step === 'analyzing' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-[500px] text-center"
                    >
                        <div className="relative w-80 h-64 md:w-[28rem] md:h-80 mb-8 rounded-2xl overflow-hidden shadow-2xl">
                            <motion.div
                                className="absolute inset-0 border-b-4 border-electric-blue-500 z-10 bg-electric-blue-500/10"
                                animate={{ top: ["0%", "100%", "0%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                            <img src={imagePreview!} alt="Analyzing" className="w-full h-full object-cover" />
                        </div>

                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
                            AI is Analyzing Context...
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-electric-blue-500" />
                            Identifying location, category, and urgency.
                        </p>
                    </motion.div>
                )}

                {/* STEP 3: VERIFY */}
                {step === 'verify' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-center"
                    >
                        {/* LEFT: Contextual Validation */}
                        <div className="space-y-6">
                            <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg group">
                                <img src={imagePreview!} alt="Report" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 text-white">
                                    <p className="text-xs font-bold uppercase tracking-wider opacity-80">Detected Urgency</p>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mt-1 ${urgency === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                                        }`}>
                                        <AlertTriangle className="w-3 h-3" /> {urgency.toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            {/* Integrated Map Verification */}
                            <div className="bg-white dark:bg-midnight-800 rounded-2xl p-1 shadow-sm border border-gray-100 dark:border-gray-700 h-[400px] lg:h-[450px] relative overflow-hidden">
                                <LocationMap location={location} isDarkMode={isDarkMode} />
                            </div>
                        </div>

                        {/* RIGHT: Form Data */}
                        <div className="bg-white dark:bg-midnight-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col h-fit">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                Verify Details
                            </h2>

                            <div className="space-y-6 flex-1">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Issue Category</label>
                                    <input
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-midnight-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-800 dark:text-white focus:ring-2 focus:ring-electric-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-midnight-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white focus:ring-2 focus:ring-electric-blue-500 outline-none min-h-[120px] resize-none"
                                    />
                                </div>

                                <div className="mt-auto pt-4">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="w-full py-4 bg-gradient-to-r from-electric-blue-600 to-electric-blue-700 hover:from-electric-blue-500 hover:to-electric-blue-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processing Report...
                                            </>
                                        ) : (
                                            'Confirm & Submit'
                                        )}
                                    </button>
                                    <button
                                        onClick={() => { setStep('capture'); setImage(null); }}
                                        className="w-full mt-3 py-3 text-gray-500 dark:text-gray-400 font-semibold hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                    >
                                        Cancel & Retake
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
                        className="flex flex-col items-center justify-center h-[500px] text-center glass-card rounded-3xl"
                    >
                        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Report Submitted!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                            Your report has been successfully logged. You can track its live status in your dashboard.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                className="px-8 py-3 bg-gray-100 dark:bg-midnight-800 text-gray-700 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-midnight-700 transition-colors"
                            >
                                View Dashboard
                            </button>
                            <button
                                onClick={() => {
                                    setStep('capture');
                                    setImage(null);
                                    setImagePreview(null);
                                }}
                                className="px-8 py-3 bg-electric-blue-600 text-white rounded-xl font-bold hover:bg-electric-blue-700 transition-colors shadow-lg"
                            >
                                Submit Another
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

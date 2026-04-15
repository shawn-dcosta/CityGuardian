import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Upload, Send, Loader, Image as ImageIcon, FileText } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import axios from 'axios';
import { generatePDF } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { AUTH_API_URL, AI_API_URL } from '../config';
import DuplicateModal from './DuplicateModal';

interface ReportingFormProps {
  location: {
    latitude: number | null;
    longitude: number | null;
    address: string;
    loading: boolean;
    error: string | null;
  };
  addToast: (message: string, type: 'info' | 'success' | 'error' | 'warning') => void;
  onReportSubmitted: (data: any) => void;
}

const ReportingForm: React.FC<ReportingFormProps> = ({ location, addToast, onReportSubmitted }) => {
  const { isAuthenticated, user, token, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    complaint: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // Duplicate Handling
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateData, setDuplicateData] = useState<{ id: string, issue: string, status: string, location: string } | null>(null);

  const { isListening, transcript, isSupported, startListening } = useSpeechRecognition();

  // ... (existing useEffect and handlers)

  // Update complaint field when speech recognition completes
  useEffect(() => {
    if (transcript) {
      setFormData(prev => ({ ...prev, complaint: transcript }));
      addToast('Voice captured successfully!', 'success');
    }
  }, [transcript, addToast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = async () => {
        setImagePreview(reader.result as string);

        // Real AI Analysis
        setIsAnalyzing(true);
        setAiSuggestion(null);

        const analysisPayload = new FormData();
        analysisPayload.append('image', file);

        try {
          const response = await axios.post(`${AI_API_URL}/analyze-image`, analysisPayload, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          const data = response.data;
          if (data.valid) {
            setAiSuggestion(data.suggestion);
            addToast(`✔️ AI Analysis: ${data.suggestion}`, 'success');

            // Auto-fill description if empty
            setFormData(prev => {
              if (!prev.complaint.trim()) {
                return { ...prev, complaint: data.description };
              }
              return prev;
            });
          } else {
            setAiSuggestion('⚠️ Issue Unclear');
            addToast(data.suggestion || 'Issue not clearly visible', 'warning');
          }
        } catch (error) {
          console.error("AI Analysis failed", error);
          setAiSuggestion('Analysis Failed');
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      addToast('Already listening...', 'info');
      return;
    }
    startListening();
    addToast('Listening... Please speak clearly', 'info');
  };

  const handleUpvote = async () => {
    if (!duplicateData?.id) return;

    const userEmail = user?.email || formData.email;
    if (!userEmail) {
      addToast("Please provide an email to upvote", "warning");
      return;
    }

    try {
      await axios.post(`${AI_API_URL}/upvote-report`, {
        report_id: duplicateData.id,
        user_email: userEmail
      });
      addToast("Report upvoted & subscribed for updates!", "success");
      setDuplicateModalOpen(false);
      // Optional: Clear form or reset
      setFormData({ name: '', email: '', complaint: '' });
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Upvote failed", error);
      addToast("Failed to upvote report", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.latitude) {
      addToast('Wait for location to load', 'warning');
      return;
    }

    if (!formData.complaint.trim() && !imageFile) {
      addToast('Please provide a description OR upload a photo', 'warning');
      return;
    }

    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append('name', formData.name || 'Anonymous');
    submitData.append('email', formData.email || 'no-email@provided.com');
    submitData.append('complaint', formData.complaint);
    if (location.latitude) submitData.append('latitude', location.latitude.toString());
    if (location.longitude) submitData.append('longitude', location.longitude.toString());
    submitData.append('address', location.address);

    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      const response = await axios.post(
        `${AI_API_URL}/send-report`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const data = response.data;

      if (data.status === 'success') {
        // Link report to user if authenticated
        if (isAuthenticated && user && token && data.id) {
          try {
            await axios.put(`${AUTH_API_URL}/auth/add-report`, { reportId: data.id }, {
              headers: { 'x-auth-token': token }
            });
            await refreshUser();
          } catch (error) {
            console.error("Failed to link report to user:", error);
          }
        }

        const finalDescription = formData.complaint.trim() || data.ai_description || 'Image-based report';
        addToast('Success! Downloading Receipt...', 'success');
        onReportSubmitted(data);
        generatePDF(
          formData.name || 'Anonymous',
          finalDescription,
          data.department,
          location.address
        );

        setFormData({ name: '', email: '', complaint: '' });
        setImageFile(null);
        setImagePreview(null);

        setTimeout(() => {
          addToast('Your report is being processed', 'info');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Submission error:', error);

      if (error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail || '';
        const message = error.response.data?.message || '';

        switch (status) {
          case 400:
            if (detail.toLowerCase().includes('not a civic issue') || detail.toLowerCase().includes('image rejected')) {
              addToast('❌ Image Rejected: Not a civic issue.', 'error');
            } else {
              addToast(detail || message || 'Invalid submission.', 'error');
            }
            break;

          case 409:
            // Capture Duplicate Data and Show Modal
            const dupData = error.response.data;
            setDuplicateData({
              id: dupData.original_report_id,
              issue: dupData.original_issue,
              status: 'Pending', // Default/Inferred
              location: location.address
            });
            setDuplicateModalOpen(true);
            addToast('📍 Duplicate Found: Similar report exists nearby', 'info');
            break;

          case 500:
            addToast('🔧 Server Error. Please try again.', 'error');
            break;

          default:
            addToast(`Error ${status}: Unable to submit report.`, 'error');
        }
      } else if (error.request) {
        addToast('🌐 Connection Error.', 'error');
      } else {
        addToast('⚠️ Unexpected Error', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/40 dark:bg-city-surface/40 backdrop-blur-2xl rounded-[2rem] border border-gray-200/50 dark:border-white/10 p-6 md:p-8 relative overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] font-sans"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none -z-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-city-blue/10 blur-[80px] rounded-full pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>

        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200/50 dark:border-white/10 relative z-10">
          <div className="p-2 rounded-xl bg-city-blue/10 border border-city-blue/20 shadow-inner">
              <FileText className="w-5 h-5 text-city-blue" />
          </div>
          <div>
              <h2 className="font-heading text-2xl font-black uppercase tracking-tighter text-city-black dark:text-white drop-shadow-sm leading-none">
                Report a Civic Issue
              </h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Submit visual or text evidence</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Name Input */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 ml-1 group-focus-within:text-city-blue transition-colors">Citizen Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your Name (Optional if Signed In)"
              className="w-full px-4 py-3.5 bg-white/50 dark:bg-[#0a0a0a]/50 rounded-xl border border-gray-200/50 dark:border-white/10 shadow-inner text-sm font-bold uppercase tracking-widest text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-city-blue focus:ring-1 focus:ring-city-blue transition-all"
            />
          </motion.div>

          {/* Email Input */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
             <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 ml-1 group-focus-within:text-city-blue transition-colors">Citizen Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Your Email (Optional if Signed In)"
              className="w-full px-4 py-3.5 bg-white/50 dark:bg-[#0a0a0a]/50 rounded-xl border border-gray-200/50 dark:border-white/10 shadow-inner text-sm font-bold uppercase tracking-widest text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-city-blue focus:ring-1 focus:ring-city-blue transition-all"
            />
          </motion.div>

          {/* Complaint Textarea */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
             <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 ml-1 group-focus-within:text-city-blue transition-colors">Vector Description</label>
            <textarea
              name="complaint"
              value={formData.complaint}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe the issue (e.g., Pothole, broken light...)"
              className="w-full px-4 py-3.5 bg-white/50 dark:bg-[#0a0a0a]/50 rounded-xl border border-gray-200/50 dark:border-white/10 shadow-inner text-sm font-bold uppercase tracking-widest text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-city-blue focus:ring-1 focus:ring-city-blue transition-all resize-none"
            />
          </motion.div>

          {/* Voice & Image Inputs */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-3 pt-2"
          >
            <motion.button
              type="button"
              onClick={handleVoiceInput}
              disabled={!isSupported || isListening}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#050505] transition-all shadow-sm ${isListening
                ? 'bg-city-red text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-city-red'
                : 'bg-white/50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200/50 dark:border-white/10'
                } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
              <span className="truncate">{isListening ? 'Recording...' : isSupported ? 'Voice Input' : 'N/A'}</span>
            </motion.button>

            <label className="relative cursor-pointer h-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-4 py-3.5 h-full rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest bg-white/50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200/50 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#050505] transition-all shadow-sm"
              >
                <Upload className="w-4 h-4 text-city-blue" />
                <span className="truncate">Upload Image</span>
              </motion.div>
            </label>
          </motion.div>

          {/* Image upload hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center px-4"
          >
             Upload photos of potholes, broken lights, leakages, or damage.
          </motion.p>

          {/* Image Preview */}
          <AnimatePresence>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, height: 0 }}
                animate={{ opacity: 1, scale: 1, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                className="relative rounded-2xl overflow-hidden shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] border border-gray-200/50 dark:border-white/10"
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-56 object-cover"
                />

                {/* AI Scanning Overlay */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-city-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                    <div className="relative w-full h-1.5 bg-city-blue/30 absolute top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
                    <Loader className="w-8 h-8 text-city-blue animate-spin mb-3 drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
                    <p className="text-white font-black text-xs uppercase tracking-[0.2em] animate-pulse">Scanning Visual Data...</p>
                  </div>
                )}

                {/* AI Suggestion Badge */}
                {!isAnalyzing && aiSuggestion && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute top-3 left-3 bg-white/90 dark:bg-city-black/90 backdrop-blur-md text-city-black dark:text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg border border-gray-200/50 dark:border-white/10 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-city-blue animate-pulse -ml-1"></span>
                    {aiSuggestion}
                  </motion.div>
                )}

                <motion.button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setAiSuggestion(null);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 bg-white/90 dark:bg-city-black/90 backdrop-blur-md text-gray-500 hover:text-city-red rounded-lg p-2 shadow-lg border border-gray-200/50 dark:border-white/10 transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`w-full py-4 mt-6 rounded-xl text-sm font-black uppercase tracking-widest text-white transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#050505] relative overflow-hidden group ${isSubmitting
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
              : 'bg-city-blue hover:bg-blue-600 shadow-[0_5px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_5px_25px_rgba(37,99,235,0.4)]'
              }`}
          >
             {/* Hover glare effect */}
            {!isSubmitting && <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[45deg] group-hover:left-[200%] transition-all duration-700 ease-in-out pointer-events-none"></div>}

            <span className="flex items-center justify-center gap-3 relative z-10">
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Transmitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Initiate Upload Report
                </>
              )}
            </span>
          </motion.button>
        </form>
      </motion.div>

      <DuplicateModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        originalReport={duplicateData}
        onUpvote={handleUpvote}
      />
    </>
  );
};

export default ReportingForm;

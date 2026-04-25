import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AUTH_API_URL } from '../config';
import { UserPlus, Shield, Mail, KeyRound, User } from 'lucide-react';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [isHovering, setIsHovering] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const { name, email, password, confirmPassword } = formData;

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const res = await axios.post(`${AUTH_API_URL}/auth/register`, { name, email, password });
            login(res.data.token, res.data.user);
            navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Registration failed. Connection rejected.');
        }
    };

    const onGoogleSuccess = async (credentialResponse: any) => {
        try {
            const res = await axios.post(`${AUTH_API_URL}/auth/google`, {
                token: credentialResponse.credential
            });
            login(res.data.token, res.data.user);
            navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Google Authentication verification failed. Access denied.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden bg-[#030303] font-sans selection:bg-city-blue/30 selection:text-city-blue">
            {/* Cinematic Background Accents */}
            <div className="absolute top-1/4 -left-20 w-[700px] h-[700px] bg-city-blue/15 blur-[160px] rounded-full pointer-events-none animate-pulse duration-[4000ms]" />
            <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-city-orange/10 blur-[140px] rounded-full pointer-events-none" style={{ animation: "pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            
            {/* Texture Overlays */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-md w-full relative z-10 bg-white/5 backdrop-blur-[32px] p-10 rounded-3xl border border-white/10 shadow-[0_0_60px_-15px_rgba(37,99,235,0.15)] overflow-hidden"
            >
                {/* Glass Inner Shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                <div className="text-center mb-10 relative">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex p-4 rounded-xl bg-white/10 border border-white/10 text-white mb-6 relative overflow-hidden group shadow-inner"
                    >
                        <Shield className="w-10 h-10 relative z-10 text-city-blue drop-shadow-md" />
                        <div className="absolute inset-0 bg-city-blue/10 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-xl" />
                    </motion.div>
                    <h2 className="font-heading text-4xl font-black text-white tracking-tighter drop-shadow-md">Join The Grid</h2>
                    <p className="text-xs font-bold text-city-blue uppercase tracking-[0.25em] mt-3 opacity-90">Create Clearance</p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-8 p-4 rounded-xl border border-city-red/30 bg-city-red/5 flex items-center gap-3 backdrop-blur-sm"
                    >
                        <div className="w-2 h-2 rounded-full bg-city-red animate-pulse" />
                        <p className="text-city-red text-xs font-bold uppercase tracking-widest leading-relaxed flex-1">
                            {error}
                        </p>
                    </motion.div>
                )}

                <form onSubmit={onSubmit} className="space-y-5 flex flex-col">
                    <div className="group relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 flex justify-center text-gray-400 group-focus-within:text-city-blue transition-colors">
                            <User className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={onChange}
                            placeholder="Full Name"
                            required
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 focus:border-city-blue rounded-xl text-white placeholder-gray-500 outline-none transition-all focus:ring-4 focus:ring-city-blue/20 font-medium shadow-sm"
                        />
                    </div>
                    
                    <div className="group relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 flex justify-center text-gray-400 group-focus-within:text-city-blue transition-colors">
                            <Mail className="w-5 h-5" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            placeholder="Email"
                            required
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 focus:border-city-blue rounded-xl text-white placeholder-gray-500 outline-none transition-all focus:ring-4 focus:ring-city-blue/20 font-medium shadow-sm"
                        />
                    </div>
                    
                    <div className="group relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 flex justify-center text-gray-400 group-focus-within:text-city-blue transition-colors">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            placeholder="Password"
                            required
                            minLength={6}
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 focus:border-city-blue rounded-xl text-white placeholder-gray-500 outline-none transition-all focus:ring-4 focus:ring-city-blue/20 font-medium shadow-sm"
                        />
                    </div>
                    
                    <div className="group relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 flex justify-center text-gray-400 group-focus-within:text-city-blue transition-colors">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={onChange}
                            placeholder="Confirm Password"
                            required
                            minLength={6}
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 focus:border-city-blue rounded-xl text-white placeholder-gray-500 outline-none transition-all focus:ring-4 focus:ring-city-blue/20 font-medium shadow-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        className="relative w-full py-4 mt-4 bg-city-black dark:bg-white text-white dark:text-city-black rounded-xl font-black uppercase tracking-widest overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98]"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            REGISTER
                            <UserPlus className={`w-5 h-5 transition-transform duration-300 ${isHovering ? 'scale-110' : ''}`} />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-city-blue/80 to-blue-600 dark:from-gray-200 dark:to-white transform scale-x-0 origin-left transition-transform duration-300 ease-out z-0" style={{ transform: isHovering ? 'scaleX(1)' : 'scaleX(0)' }} />
                    </button>
                </form>

                <div className="mt-8 relative z-20">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest text-city-surface">
                            <span className="px-4 bg-transparent backdrop-blur-md text-gray-400 rounded-full italic">Secure SSO Provider</span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center scale-105 hover:scale-110 transition-transform duration-300 origin-center drop-shadow-sm hover:drop-shadow-lg">
                        <GoogleLogin
                            onSuccess={onGoogleSuccess}
                            onError={() => setError('Google Authentication Failed. Communication error.')}
                            theme="filled_black"
                            shape="pill"
                            text="signup_with"
                        />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Already authorized?{' '}
                        <Link to="/login" className="text-city-blue hover:text-blue-600 dark:text-city-blue dark:hover:text-blue-400 hover:underline underline-offset-4 transition-colors">
                            LOGIN
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;

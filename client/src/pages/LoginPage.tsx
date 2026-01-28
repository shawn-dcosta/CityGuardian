import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AUTH_API_URL } from '../config';
import { LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${AUTH_API_URL}/auth/login`, formData);
            login(res.data.token, res.data.user);
            navigate(res.data.user.role === 'admin' ? '/dashboard' : '/');
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Login failed');
        }
    };

    const onGoogleSuccess = async (credentialResponse: any) => {
        try {
            const res = await axios.post(`${AUTH_API_URL}/auth/google`, {
                token: credentialResponse.credential
            });
            login(res.data.token, res.data.user);
            navigate(res.data.user.role === 'admin' ? '/dashboard' : '/');
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Google Login failed');
        }
    };

    return (
        <div className="min-h-screen pt-20 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full glass-card p-8 rounded-2xl"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-xl bg-electric-blue-100 dark:bg-electric-blue-900/30 text-electric-blue-600 mb-4">
                        <LogIn className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Welcome Back</h2>
                    <p className="text-gray-500 dark:text-gray-400">Sign in to continue to CityGuardian</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                            className="w-full px-4 py-2 rounded-xl bg-white/50 dark:bg-deep-charcoal-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-electric-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                            className="w-full px-4 py-2 rounded-xl bg-white/50 dark:bg-deep-charcoal-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-electric-blue-500 outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-electric-blue-600 to-electric-blue-700 hover:from-electric-blue-500 hover:to-electric-blue-600 text-white rounded-xl font-medium shadow-lg shadow-electric-blue-500/30 transition-all"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-deep-charcoal-800 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <GoogleLogin
                            onSuccess={onGoogleSuccess}
                            onError={() => setError('Google Login Failed')}
                            theme="filled_blue"
                            shape="circle"
                        />
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-electric-blue-600 hover:text-electric-blue-500">
                        Sign up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;

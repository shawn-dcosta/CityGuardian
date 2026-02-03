import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <Camera className="w-8 h-8 text-electric-blue-500" />,
            title: "Snap & Report",
            description: "Take a photo of any civic issue. Our AI automatically analyzes and categorizes it."
        },
        {
            icon: <MapPin className="w-8 h-8 text-purple-500" />,
            title: "Pinpoint Location",
            description: "Precise GPS tagging ensures verified repair crews know exactly where to go."
        },
        {
            icon: <CheckCircle className="w-8 h-8 text-green-500" />,
            title: "Track & Resolve",
            description: "Watch your report move from 'Submitted' to 'Fixed' in real-time."
        }
    ];

    const stats = [
        { label: "Reports Solved", value: "12,405" },
        { label: "Active Citizens", value: "8,320" },
        { label: "Avg. Fix Time", value: "48 Hrs" }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-midnight-900 overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-midnight-800 dark:to-midnight-900 -z-10" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-electric-blue-500/10 to-transparent blur-3xl -z-10" />

                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="md:w-1/2 text-center md:text-left"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                </span>
                                Live Civic Action Platform
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-gray-900 dark:text-white">
                                Fix Your City <br />
                                <span className="bg-gradient-to-r from-electric-blue-500 to-purple-600 bg-clip-text text-transparent">
                                    In One Click.
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                Join the movement creating smarter, safer neighborhoods. Use AI to report potholes, streetlights, and more instantly.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-8 py-4 bg-electric-blue-600 hover:bg-electric-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                                >
                                    Get Started
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl font-bold text-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                >
                                    Learn More
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="md:w-1/2 relative"
                        >
                            <div className="relative z-10 p-6 glass-card rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700">
                                <img
                                    src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"
                                    alt="City Guardian App Interface"
                                    className="rounded-xl w-full shadow-lg"
                                />
                                {/* Floating Badge */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl flex items-center gap-3 border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Status Update</p>
                                        <p className="font-bold text-gray-800 dark:text-white">Pothole Fixed!</p>
                                    </div>
                                </motion.div>
                            </div>
                            {/* Decorative blobs */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl rounded-full -z-10" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-10 bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="flex flex-col items-center text-center">
                                <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-gray-50 dark:bg-midnight-900">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                            How It <span className="text-electric-blue-600">Works</span>
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Empowering citizens with technology. Reporting issues has never been this simple or effective.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700"
                            >
                                <div className="bg-gray-50 dark:bg-gray-700/50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-24 bg-white dark:bg-midnight-800">
                <div className="container mx-auto px-6">
                    <div className="bg-gradient-to-r from-electric-blue-600 to-indigo-600 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
                                Ready to Make an Impact?
                            </h2>
                            <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                                Join thousands of citizens who are already transforming their neighborhoods one report at a time.
                            </p>
                            <button
                                onClick={() => navigate('/register')}
                                className="px-10 py-5 bg-white text-electric-blue-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                            >
                                Get Started Now
                            </button>
                        </div>
                        {/* Abstract shapes */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, CheckCircle, ArrowRight, Shield, Zap } from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <Camera className="w-8 h-8 text-city-blue" />,
            title: "SNAPPING",
            description: "Capture civic issues instantly. AI analyzes and categorizes them on the spot, deploying context to authorities."
        },
        {
            icon: <MapPin className="w-8 h-8 text-city-orange" />,
            title: "TRACKING",
            description: "Precise GPS locators ensure verified city maintenance crews know exactly where to strike."
        },
        {
            icon: <CheckCircle className="w-8 h-8 text-city-green" />,
            title: "RESOLVING",
            description: "Watch your city heal in real-time as reports rapidly transition from active emergencies to solved cases."
        }
    ];

    const stats = [
        { label: "ISSUES RESOLVED", value: "12,405" },
        { label: "ACTIVE CITIZENS", value: "8,320" },
        { label: "AVG. FIX TIME", value: "48H" }
    ];

    return (
        <div className="min-h-screen bg-city-surface-light dark:bg-city-black overflow-x-hidden selection:bg-city-red/20 selection:text-city-red font-sans">
            {/* Cinematic Hero */}
            <section className="relative min-h-[95vh] flex flex-col justify-center pt-24 pb-12 overflow-hidden bg-[#030303]">
                {/* Tactical Grid Background */}
                <div className="absolute inset-0 opacity-[0.15] pointer-events-none" 
                     style={{ 
                         backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                         backgroundSize: '40px 40px'
                     }}>
                </div>

                {/* Dynamic Ambient Background Elements */}
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-city-blue/20 blur-[130px] rounded-full pointer-events-none animate-pulse duration-1000" />
                <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-city-red/15 blur-[120px] rounded-full pointer-events-none" style={{ animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
                
                {/* Texture Overlays */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,transparent_0%,#030303_100%)] pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full max-w-5xl"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-city-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md text-city-black dark:text-white text-xs font-bold uppercase tracking-widest mb-8 shadow-sm"
                        >
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-city-red opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-city-red"></span>
                            </span>
                            Next-Gen Civic Platform
                        </motion.div>
                        
                        <h1 className="font-heading text-[11vw] md:text-[7.5rem] font-black tracking-tighter leading-[0.9] text-white uppercase mb-6 drop-shadow-2xl">
                            Empower <br/>
                            <span className="relative inline-block mt-2">
                                <span className="absolute -inset-1 blur-2xl bg-gradient-to-r from-city-blue to-city-red opacity-40 animate-pulse"></span>
                                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-city-blue via-purple-500 to-city-red filter drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                                    Reality.
                                </span>
                            </span>
                        </h1>
                        
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 font-medium tracking-tight"
                        >
                            Join the movement creating smarter, safer neighborhoods. Use AI to report and eliminate urban degradation instantly.
                        </motion.p>
                        

                    </motion.div>
                </div>

                {/* Scroll Indicator */}

            </section>

            {/* Stark Stats Strip */}
            <section className="relative z-20 border-y border-city-black/10 dark:border-white/10 bg-white/50 dark:bg-city-surface/50 backdrop-blur-xl">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-city-black/10 dark:divide-white/10">
                        {stats.map((stat, index) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                key={index} 
                                className="flex flex-col items-center justify-center py-16 px-6 relative group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-city-blue/5 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
                                <h3 className="font-heading text-6xl md:text-7xl font-black text-city-black dark:text-white mb-2 relative z-10 drop-shadow-md">{stat.value}</h3>
                                <p className="text-sm font-bold text-city-blue dark:text-gray-400 tracking-widest uppercase relative z-10">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Monolithic Features */}
            <section className="py-32 bg-city-surface-light dark:bg-city-black relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-1/2 left-0 w-96 h-96 bg-city-blue/5 dark:bg-city-blue/10 blur-[100px] rounded-full point-events-none -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-city-orange/5 dark:bg-city-orange/10 blur-[100px] rounded-full point-events-none translate-x-1/3 translate-y-1/3" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-24 gap-12">
                        <div className="flex-1">
                            <h2 className="font-heading text-6xl md:text-8xl font-black text-city-black dark:text-white uppercase tracking-tighter leading-[0.85]">
                                HOW IT <br/> 
                                <span className="text-gray-900 dark:text-gray-100">WORKS.</span>
                            </h2>
                        </div>
                        <div className="flex-1 max-w-md border-l-[1.5px] border-city-blue/40 pl-8 ml-auto">
                            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium leading-snug tracking-tight">
                                Reporting urban degradation has never been this simple, or this visually striking.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15, duration: 0.6 }}
                                className="group relative bg-white/80 dark:bg-city-surface/80 backdrop-blur-lg border border-gray-200/50 dark:border-white/10 p-10 rounded-2xl hover:border-city-blue/30 dark:hover:border-city-blue/50 transition-all duration-500 hover:shadow-2xl hover:shadow-city-blue/5 dark:hover:shadow-city-blue/10"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none group-hover:scale-110 group-hover:opacity-10 dark:group-hover:opacity-20 transition-all duration-500">
                                    {React.cloneElement(feature.icon as React.ReactElement<any>, { className: "w-32 h-32" })}
                                </div>
                                <div className="mb-10 inline-flex p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-inner group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300 relative z-10">
                                    {feature.icon}
                                </div>
                                <h3 className="font-heading text-3xl font-black mb-4 text-city-black dark:text-white uppercase tracking-tight relative z-10">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed relative z-10">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* The Final Push */}
            <section className="relative py-40 bg-city-black dark:bg-city-surface overflow-hidden flex flex-col items-center justify-center text-center px-6">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-city-red/10 dark:to-city-red/5" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10"
                >
                    <div className="inline-flex items-center justify-center mb-8">
                        <Shield className="w-16 h-16 text-city-red object-contain mb-4" />
                    </div>
                    <h2 className="font-heading text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-8 drop-shadow-xl">
                        Make It <span className="text-city-red">Right.</span>
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto mb-12 text-xl">The city needs guardians. Time to step up.</p>
                    <button
                        onClick={() => navigate('/register')}
                        className="group relative px-14 py-6 bg-city-red text-white rounded-xl font-black uppercase tracking-widest text-xl overflow-hidden shadow-[0_0_40px_rgba(211,18,18,0.4)] hover:shadow-[0_0_60px_rgba(211,18,18,0.6)] transition-all duration-300"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            Start Now
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    </button>
                </motion.div>
            </section>
        </div>
    );
};

export default LandingPage;

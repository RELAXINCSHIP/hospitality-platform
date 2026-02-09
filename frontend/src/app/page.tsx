'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChefHat, Smartphone, Users, Monitor, ArrowRight, Activity, Sparkles, Music, Utensils } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-void flex flex-col relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-gold/5 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-purple-500/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-[40%] right-[20%] w-[40%] h-[40%] bg-emerald/3 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Navigation */}
            <nav className="relative z-20 px-8 py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-gold" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">UNITY<span className="text-gold">OS</span></span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-xs font-mono text-emerald flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald rounded-full animate-pulse"></span>
                        SYSTEM ONLINE
                    </span>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 flex flex-col items-center justify-center pt-20 pb-16 px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-4xl"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/10 mb-8">
                        <Sparkles className="h-4 w-4 text-gold" />
                        <span className="text-sm text-gold font-medium">Enterprise Hospitality Intelligence</span>
                    </div>

                    <h1 className="text-7xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-none">
                        THE FUTURE OF
                        <br />
                        <span className="bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text text-transparent">
                            HOSPITALITY
                        </span>
                    </h1>

                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        AI-powered operating system for premium restaurants and nightlife venues.
                        Real-time intelligence. Seamless operations. Elevated experiences.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link href="/host" className="px-8 py-4 bg-gold hover:bg-gold/90 text-black font-bold rounded-xl transition-all transform hover:scale-105 flex items-center gap-2">
                            Launch Dashboard
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link href="/xs" className="px-8 py-4 border border-white/20 hover:border-gold/50 text-white font-bold rounded-xl transition-all hover:bg-white/5 flex items-center gap-2">
                            <Music className="h-5 w-5 text-purple-400" />
                            XS Nightclub Mode
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Venue Cards */}
            <section className="relative z-10 px-8 pb-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-2">Choose Your Experience</h2>
                        <p className="text-zinc-500">Select a module to begin operations</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* XS Nightclub - Featured */}
                        <Link href="/xs" className="group lg:col-span-2">
                            <motion.div
                                whileHover={{ y: -8 }}
                                className="relative h-80 rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-black"
                            >
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50" />
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
                                <div className="relative h-full p-8 flex flex-col justify-between">
                                    <div>
                                        <div className="w-16 h-16 rounded-2xl bg-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Music className="h-8 w-8 text-purple-400" />
                                        </div>
                                        <h3 className="text-3xl font-black text-white mb-2">XS NIGHTCLUB</h3>
                                        <p className="text-zinc-400">Premium bottle service, floor management, and VIP operations for high-volume nightlife.</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full">LAS VEGAS</span>
                                        <ArrowRight className="h-6 w-6 text-purple-400 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>

                        {/* Host Stand */}
                        <Link href="/host" className="group">
                            <motion.div
                                whileHover={{ y: -8 }}
                                className="h-80 rounded-3xl p-6 border border-gold/20 bg-gradient-to-br from-charcoal to-void flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center mb-4 text-gold group-hover:scale-110 transition-transform">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Host Stand</h3>
                                    <p className="text-sm text-zinc-500">Floor plan, waitlist, reservations</p>
                                </div>
                                <div className="flex items-center text-xs text-gold font-mono">
                                    <Activity className="h-3 w-3 mr-1" /> ACTIVE
                                </div>
                            </motion.div>
                        </Link>

                        {/* Server Tablet */}
                        <Link href="/tablet" className="group">
                            <motion.div
                                whileHover={{ y: -8 }}
                                className="h-80 rounded-3xl p-6 border border-sapphire/20 bg-gradient-to-br from-charcoal to-void flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-sapphire/20 flex items-center justify-center mb-4 text-sapphire group-hover:scale-110 transition-transform">
                                        <Smartphone className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Server Tablet</h3>
                                    <p className="text-sm text-zinc-500">Orders, tabs, payments</p>
                                </div>
                                <div className="flex items-center text-xs text-sapphire font-mono">
                                    <Activity className="h-3 w-3 mr-1" /> ACTIVE
                                </div>
                            </motion.div>
                        </Link>

                        {/* Kitchen Display */}
                        <Link href="/kds" className="group">
                            <motion.div
                                whileHover={{ y: -8 }}
                                className="h-80 rounded-3xl p-6 border border-emerald/20 bg-gradient-to-br from-charcoal to-void flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-emerald/20 flex items-center justify-center mb-4 text-emerald group-hover:scale-110 transition-transform">
                                        <Monitor className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Kitchen Display</h3>
                                    <p className="text-sm text-zinc-500">Real-time order queue</p>
                                </div>
                                <div className="flex items-center text-xs text-emerald font-mono">
                                    <Activity className="h-3 w-3 mr-1" /> LIVE SYNC
                                </div>
                            </motion.div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="relative z-10 border-t border-white/5 py-8 px-8 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-12 text-center">
                    <div>
                        <div className="text-3xl font-black text-gold">$2.5M+</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider">Avg Nightly Revenue</div>
                    </div>
                    <div className="w-px h-12 bg-white/10 hidden md:block" />
                    <div>
                        <div className="text-3xl font-black text-emerald">99.9%</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider">System Uptime</div>
                    </div>
                    <div className="w-px h-12 bg-white/10 hidden md:block" />
                    <div>
                        <div className="text-3xl font-black text-purple-400">35+</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider">Tables Managed</div>
                    </div>
                    <div className="w-px h-12 bg-white/10 hidden md:block" />
                    <div>
                        <div className="text-3xl font-black text-sapphire">10ms</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider">Response Time</div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-6 px-8 border-t border-white/5 text-center">
                <p className="text-sm text-zinc-600">
                    UNITY OS v0.2.0 • © 2026 Premium Hospitality Systems
                </p>
            </footer>
        </div>
    );
}

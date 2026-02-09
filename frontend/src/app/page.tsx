'use client';

import Link from 'next/link';
import { ChefHat, Smartphone, Users, Monitor, ArrowRight, Activity } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-void flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald/5 rounded-full blur-[100px]" />
            </div>

            <div className="z-10 text-center mb-16 animate-fade-in-up">
                <div className="w-24 h-24 rounded-3xl bg-gold/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-gold/20 shadow-glow">
                    <ChefHat className="h-12 w-12 text-gold" />
                </div>
                <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
                    HOSPITALITY<span className="text-gold">OS</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                    The next-generation operating system for modern dining experiences.
                    AI-driven, real-time, and seamless.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 z-10 max-w-7xl w-full px-8">
                {/* Host Card */}
                <Link href="/host" className="group">
                    <div className="glass-card-elevated p-8 h-full rounded-2xl hover:border-gold/30 hover:bg-white/5 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="w-14 h-14 rounded-xl bg-gold/20 flex items-center justify-center mb-6 text-gold group-hover:scale-110 transition-transform">
                            <Users className="h-7 w-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-between">
                            Host Stand
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-gold opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            Manage floor plan, waitlist, and incoming reservations.
                        </p>
                        <div className="flex items-center text-xs text-gold font-mono uppercase tracking-wider">
                            <Activity className="h-3 w-3 mr-1" /> Active
                        </div>
                    </div>
                </Link>
                {/* Tablet Card */}
                <Link href="/tablet" className="group">
                    <div className="glass-card-elevated p-8 h-full rounded-2xl hover:border-gold/30 hover:bg-white/5 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="w-14 h-14 rounded-xl bg-sapphire/20 flex items-center justify-center mb-6 text-sapphire group-hover:scale-110 transition-transform">
                            <Smartphone className="h-7 w-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-between">
                            Server Tablet
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-gold opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            Point of service interface for floor staff. Manage tables, orders, and payments.
                        </p>
                        <div className="flex items-center text-xs text-sapphire font-mono uppercase tracking-wider">
                            <Activity className="h-3 w-3 mr-1" /> Active
                        </div>
                    </div>
                </Link>

                {/* KDS Card */}
                <Link href="/kds" className="group">
                    <div className="glass-card-elevated p-8 h-full rounded-2xl hover:border-emerald/30 hover:bg-white/5 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="w-14 h-14 rounded-xl bg-emerald/20 flex items-center justify-center mb-6 text-emerald group-hover:scale-110 transition-transform">
                            <Monitor className="h-7 w-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-between">
                            Kitchen Display
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            Real-time order management for the kitchen brigade. Bump and optimize workflow.
                        </p>
                        <div className="flex items-center text-xs text-emerald font-mono uppercase tracking-wider">
                            <Activity className="h-3 w-3 mr-1" /> Live Sync
                        </div>
                    </div>
                </Link>

                {/* Agent Card */}
                <Link href="/agents" className="group">
                    <div className="glass-card-elevated p-8 h-full rounded-2xl hover:border-ruby/30 hover:bg-white/5 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="w-14 h-14 rounded-xl bg-ruby/20 flex items-center justify-center mb-6 text-ruby group-hover:scale-110 transition-transform">
                            <Users className="h-7 w-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-between">
                            Guest Simulation
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-ruby opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            AI-powered guest simulation to test traffic flow, order load, and system stress.
                        </p>
                        <div className="flex items-center text-xs text-ruby font-mono uppercase tracking-wider">
                            <Activity className="h-3 w-3 mr-1" /> Available
                        </div>
                    </div>
                </Link>
            </div>

            <div className="mt-16 z-10 text-sm text-muted-foreground">
                <p>System Status: <span className="text-emerald">Online</span> • v0.1.0 Beta</p>
            </div>
        </div>
    );
}

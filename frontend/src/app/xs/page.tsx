"use client";

import React, { useState } from 'react';
import FloorMap from '@/components/nightclub/FloorMap';
import BottleMenu from '@/components/nightclub/BottleMenu';
import StaffManager from '@/components/nightclub/StaffManager';

const XSPage = () => {
    const [view, setView] = useState<'floor' | 'menu' | 'staff'>('floor');

    return (
        <div className="flex h-screen bg-void overflow-hidden text-foreground">
            {/* Sidebar Navigation */}
            <div className="w-20 border-r border-white/5 bg-charcoal flex flex-col items-center py-6 gap-6">
                <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center font-bold text-black mb-6">XS</div>

                <button
                    onClick={() => setView('floor')}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${view === 'floor' ? 'bg-gold/20 text-gold' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    title="Floor Plan"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                </button>

                <button
                    onClick={() => setView('menu')}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${view === 'menu' ? 'bg-gold/20 text-gold' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    title="Bottle Menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3v-4h-3V7a2 2 0 0 1 2-2h3z"></path></svg>
                </button>

                <button
                    onClick={() => setView('staff')}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${view === 'staff' ? 'bg-gold/20 text-gold' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    title="Staffing"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full relative">
                {/* Header */}
                <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-charcoal/50 backdrop-blur-md z-10">
                    <div>
                        <h1 className="text-xl font-bold tracking-widest text-white">XS NIGHTCLUB</h1>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Operational Mode</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-emerald-500 uppercase">System Live</span>
                        </div>
                    </div>
                </header>

                {/* Viewport */}
                <main className="flex-1 overflow-auto p-6 relative">
                    {/* Background Ambience */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none"></div>

                    {view === 'floor' && <FloorMap />}
                    {view === 'menu' && <BottleMenu />}
                    {view === 'staff' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                            <div className="lg:col-span-2">
                                <div className="h-full bg-charcoal/30 rounded-xl border border-white/5 flex items-center justify-center">
                                    <p className="text-zinc-500">Staff Schedule & Shifts (Calendar View)</p>
                                </div>
                            </div>
                            <div className="lg:col-span-1">
                                <StaffManager />
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default XSPage;

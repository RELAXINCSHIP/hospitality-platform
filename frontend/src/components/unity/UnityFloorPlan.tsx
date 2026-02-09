"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Configuration ---
// --- Configuration ---
const AuraStyles = {
    GOLD_PULSE: "shadow-[0_0_40px_rgba(197,160,89,0.9)] border-gold animate-pulse ring-2 ring-gold/20",
    GREEN_FLOW: "shadow-[0_0_20px_rgba(0,224,143,0.5)] border-emerald",
    RED_LINGER: "shadow-[0_0_30px_rgba(255,0,0,0.7)] border-ruby animate-pulse ring-4 ring-ruby/10",
    OFF: "border-white/10 opacity-50"
};

const XS_CONFIG = {
    INDOOR: Array.from({ length: 20 }, (_, i) => 100 + i), // ID 100-119
    OUTDOOR: Array.from({ length: 20 }, (_, i) => 600 + i), // ID 600-619
    STAGE_VIP: [681, 682, 683, 684, 685, 686, 687, 688],
    OWNERS_BOX: [670, 570, 630, 530],
};

interface Guest {
    id: string;
    name: string;
    tier: string;
    isIncognito: boolean;
    spend: number;
    yield_percent: number;
    aura: keyof typeof AuraStyles;
}

interface TableProps {
    id: number;
    guest?: Guest;
    staffRole: string; // 'MANAGER' | 'SERVER' | 'HOST'
    onParade: (id: number) => void;
}

// --- Components ---

const TableComponent: React.FC<TableProps> = ({ id, guest, staffRole, onParade }) => {
    // h.wood Rolodex Privacy Mode Logic: Level 1-3 (Server) vs Level 4 (Manager)
    const isIncognito = guest?.isIncognito && staffRole !== 'MANAGER';

    const nameToDisplay = isIncognito
        ? `INCOGNITO // ${guest?.tier}`
        : guest?.name || "VACANT";

    const auraClass = guest ? AuraStyles[guest.aura] : AuraStyles.OFF;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
                relative p-4 rounded-xl border backdrop-blur-md flex flex-col items-center justify-center gap-2
                min-h-[140px] transition-all duration-500 overflow-hidden group
                ${auraClass}
                ${guest ? 'bg-void/90' : 'bg-white/5'}
            `}
        >
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest absolute top-2 left-3">
                {id}
            </span>

            {guest ? (
                <>
                    <div className="flex flex-col items-center text-center z-10">
                        <span className={`text-sm font-bold tracking-tight mb-1 ${isIncognito ? 'text-gold italic font-serif' : 'text-white'}`}>
                            {nameToDisplay}
                        </span>
                        {!isIncognito && (
                            <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-muted-foreground uppercase tracking-wider">
                                {guest.tier}
                            </span>
                        )}
                    </div>

                    <div className="w-full mt-2 space-y-1">
                        <div className="flex justify-between text-[8px] uppercase tracking-wider text-muted-foreground">
                            <span>Yield</span>
                            <span>{guest.yield_percent}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${guest.yield_percent > 80 ? 'bg-emerald shadow-[0_0_10px_#00E08F]' : 'bg-gold'}`}
                                style={{ width: `${guest.yield_percent}%` }}
                            />
                        </div>
                    </div>

                    {/* Action Layer for Staff */}
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button
                            onClick={() => onParade(id)}
                            className="bg-gold text-black text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded hover:bg-white transition-colors"
                        >
                            Initiate Show
                        </button>
                    </div>

                    {guest.spend > 5000 && (
                        <span className="absolute bottom-2 right-2 text-[8px] font-black text-emerald uppercase tracking-widest animate-pulse">
                            $$$
                        </span>
                    )}
                </>
            ) : (
                <span className="text-xs text-muted-foreground/50 font-medium tracking-widest uppercase">Available</span>
            )}
        </motion.div>
    );
};

export default function UnityFloorPlan() {
    const [viewMode, setViewMode] = useState<'INDOOR' | 'OUTDOOR'>('OUTDOOR');
    const [staffRole, setStaffRole] = useState('MANAGER'); // Toggle for Privacy verification

    // Mock Data for "The Vault" Verification
    const mockGuests: Record<number, Guest> = {
        681: { id: "g1", name: "Drake", tier: "CHAIRMAN", isIncognito: false, spend: 55000, yield_percent: 95, aura: "GOLD_PULSE" },
        682: { id: "g2", name: "Leonardo DiCaprio", tier: "VVIP", isIncognito: true, spend: 12000, yield_percent: 45, aura: "GREEN_FLOW" },
        670: { id: "g3", name: "Steve Wynn", tier: "OWNER", isIncognito: false, spend: 0, yield_percent: 100, aura: "GOLD_PULSE" },
        105: { id: "g4", name: "Tech CEO", tier: "VIP", isIncognito: true, spend: 5000, yield_percent: 30, aura: "RED_LINGER" }
    };

    const currentTableIds = viewMode === 'OUTDOOR'
        ? [...XS_CONFIG.OUTDOOR, ...XS_CONFIG.STAGE_VIP, ...XS_CONFIG.OWNERS_BOX]
        : XS_CONFIG.INDOOR;

    const handleParadeTrigger = (tableId: number) => {
        // In real app, this hits /api/unity/vault/audit
        console.log(`[THE VAULT] Auditing Show for Table ${tableId}...`);
        const guest = mockGuests[tableId];
        if (guest && guest.spend < 2000) {
            alert(`SECURITY ALERT: Unauthorized Show at Table ${tableId}. Manager Notified.`);
        } else {
            alert(`VAULT CLEARED: Show authorized for Table ${tableId}.`);
        }
    };

    return (
        <div className="min-h-screen bg-void text-white p-8">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter italic uppercase flex items-center gap-3">
                        UNITY OS <span className="text-gold opacity-80 text-2xl not-italic normal-case font-mono tracking-normal">| XS Nightclub</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded bg-emerald/10 border border-emerald/20 text-emerald text-[10px] font-black uppercase tracking-widest">
                            Systems Nominal
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                            CORE: WYNN_INFRASTRUCTURE
                        </span>
                    </div>
                </div>

                <div className="flex gap-4">
                    {/* View Toggles */}
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => setViewMode('INDOOR')}
                            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'INDOOR' ? 'bg-white text-void' : 'text-muted-foreground hover:text-white'}`}
                        >
                            Indoor
                        </button>
                        <button
                            onClick={() => setViewMode('OUTDOOR')}
                            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'OUTDOOR' ? 'bg-white text-void' : 'text-muted-foreground hover:text-white'}`}
                        >
                            Outdoor
                        </button>
                    </div>

                    {/* Simulation Role Toggle */}
                    <button
                        onClick={() => setStaffRole(prev => prev === 'MANAGER' ? 'SERVER' : 'MANAGER')}
                        className={`px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${staffRole === 'MANAGER' ? 'bg-ruby/10 border-ruby text-ruby' : 'bg-charcoal border-white/10 text-muted-foreground'}`}
                    >
                        Role: {staffRole}
                    </button>
                </div>
            </header>

            <main className="grid grid-cols-4 gap-6">
                <AnimatePresence mode='popLayout'>
                    {currentTableIds.map(id => (
                        <TableComponent
                            key={id}
                            id={id}
                            guest={mockGuests[id]}
                            staffRole={staffRole}
                            onParade={handleParadeTrigger}
                        />
                    ))}
                </AnimatePresence>
            </main>
        </div>
    );
}

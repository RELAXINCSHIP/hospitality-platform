"use client";

import React, { useState, useEffect } from 'react';
import { API } from '@/lib/api';

interface StaffMember {
    id: string;
    name: string;
    role: string;
    status: string;
    rank: number;
}

const StaffManager = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await fetch(`${API.xs}/staff`);
                const data = await res.json();
                setStaff(data);
            } catch (error) {
                console.error("Failed to load staff", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, []);

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'BOTTLE_MODEL': return 'text-pink-400';
            case 'SECURITY': return 'text-red-400';
            case 'VIP_HOST': return 'text-gold';
            default: return 'text-zinc-400';
        }
    };

    if (loading) return <div className="p-4 text-xs text-zinc-500">Loading Roster...</div>;

    return (
        <div className="glass-panel p-6 rounded-xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Staff Roster</h2>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-emerald-400">Night Mode Active</span>
                </div>
            </div>

            <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                    {/* Bottle Models */}
                    <div className="bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                        <p className="text-xs text-zinc-500 uppercase mb-3 flex justify-between">
                            <span>Bottle Models</span>
                            <span className="text-pink-400/50">{staff.filter(s => s.role === 'BOTTLE_MODEL').length} Active</span>
                        </p>
                        <div className="space-y-2">
                            {staff.filter(s => s.role === 'BOTTLE_MODEL').map(s => (
                                <div key={s.id} className="flex justify-between items-center group cursor-pointer hover:bg-white/5 p-2 rounded transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-xs text-pink-400 font-bold">
                                            {s.rank}
                                        </div>
                                        <div>
                                            <p className="text-sm text-zinc-200 font-medium">{s.name}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase">{s.status}</p>
                                        </div>
                                    </div>
                                    <button className="text-xs bg-zinc-800 hover:bg-gold text-zinc-400 hover:text-black px-2 py-1 rounded transition-colors">
                                        Assign
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hosts & Security */}
                    <div className="bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                        <p className="text-xs text-zinc-500 uppercase mb-3">Support Staff</p>
                        <div className="space-y-2">
                            {staff.filter(s => s.role !== 'BOTTLE_MODEL').map(s => (
                                <div key={s.id} className="flex justify-between items-center p-2 rounded">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold ${getRoleColor(s.role)}`}>
                                            {s.role[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm text-zinc-300">{s.name}</p>
                                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{s.role.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
                <button className="w-full py-3 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/50 rounded font-bold text-xs uppercase tracking-widest transition-colors">
                    Optimize Assignments (AI)
                </button>
            </div>
        </div>
    );
};

export default StaffManager;

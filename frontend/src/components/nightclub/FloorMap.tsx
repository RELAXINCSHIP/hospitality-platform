"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { API } from '@/lib/api';

interface Table {
    id: string;
    number: string;
    status: string;
}

interface Section {
    section_id: string;
    name: string;
    min_spend: number;
    tables: Table[];
}

const FloorMap = () => {
    const [layout, setLayout] = useState<Section[]>([]);

    useEffect(() => {
        const fetchLayout = async () => {
            try {
                const res = await fetch(`${API.xs}/layout`);
                const data = await res.json();
                // Sort to put Stage/Dance Floor first for visual hierarchy
                const sorted = data.sort((a: Section, b: Section) => b.min_spend - a.min_spend);
                setLayout(sorted);
            } catch (error) {
                console.error("Failed to load layout", error);
            }
        }
        fetchLayout();
    }, []);

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'OCCUPIED': return 'status-occupied border-sapphire/50';
            case 'RESERVED': return 'status-vip border-gold/50';
            default: return 'status-available border-emerald/50';
        }
    }

    const getSectionStyle = (name: string) => {
        if (name.includes("Stage") || name.includes("Owner")) return "border-gold/30 bg-gold/5";
        if (name.includes("Outdoor") || name.includes("Pool")) return "border-sapphire/30 bg-sapphire/5";
        return "border-white/10 bg-black/40";
    }

    return (
        <div className="h-full w-full p-4 overflow-auto">
            <div className="floor-plan-container relative p-8 min-h-[800px]">
                <div className="absolute top-4 left-4 text-zinc-500 font-mono text-xs">
                    LIVE FLOOR VIEW • XS LAS VEGAS
                </div>

                {/* DJ BOOTH / STAGE AREA */}
                <div className="flex justify-center mb-12">
                    <div className="w-96 h-24 bg-zinc-900/80 rounded-b-3xl border-b border-x border-gold/20 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(212,168,83,0.1)]">
                        <span className="text-gold font-bold tracking-[0.5em] text-lg">DJ BOOTH</span>
                        <span className="text-xs text-zinc-600 uppercase mt-1">The Chainsmokers Live</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                    {layout.map((section) => (
                        <div key={section.section_id} className={`relative group rounded-xl p-6 border transition-all hover:border-opacity-50 ${getSectionStyle(section.name)}`}>
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-zinc-300 font-bold uppercase tracking-widest text-sm max-w-[70%]">
                                    {section.name}
                                </h3>
                                <span className="text-xs font-mono text-gold bg-gold/10 px-2 py-1 rounded">
                                    ${section.min_spend.toLocaleString()} MIN
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {section.tables.map((table) => (
                                    <motion.div
                                        key={table.id}
                                        whileHover={{ scale: 1.1 }}
                                        className={`
                                            aspect-square rounded-full flex flex-col items-center justify-center
                                            cursor-pointer transition-all shadow-lg border-2
                                            ${getStatusClass(table.status)}
                                        `}
                                    >
                                        <span className="text-xs font-bold">{table.number.split('-')[1]}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* POOL AREA INDICATOR */}
                <div className="mt-16 text-center border-t border-sapphire/20 pt-8">
                    <span className="text-sapphire/50 text-sm font-bold tracking-widest uppercase">
                        Poolside & Outdoor Zone
                    </span>
                </div>
            </div>
        </div>
    );
};

export default FloorMap;

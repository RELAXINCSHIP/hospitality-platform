"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BottleItem {
    id: string;
    name: string;
    category: string;
    price: number;
    size: string;
}

const BottleMenu = () => {
    const [menu, setMenu] = useState<BottleItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/xs/menu');
                const data = await res.json();
                setMenu(data);
            } catch (error) {
                console.error("Failed to fetch menu", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    if (loading) return <div className="text-gold animate-pulse">Loading Menu...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-widest uppercase border-b border-white/10 pb-2">
                Bottle Service
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menu.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="menu-item-card p-4 flex flex-col justify-between h-40"
                    >
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-white">{item.name}</h3>
                                <span className="text-xs font-mono text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded">
                                    IN STOCK
                                </span>
                            </div>
                            <p className="text-sm text-zinc-400 mt-1">{item.size} • {item.category}</p>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                            <span className="item-price text-2xl">${item.price.toLocaleString()}</span>
                            <button className="bg-gold/10 hover:bg-gold/20 text-gold border border-gold/50 px-3 py-1 rounded text-sm transition-colors uppercase tracking-wider">
                                Add to Tab
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default BottleMenu;

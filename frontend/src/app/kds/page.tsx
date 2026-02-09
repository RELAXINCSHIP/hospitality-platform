'use client';

import { useState, useEffect } from 'react';
import { useRestaurant } from "@/context/RestaurantContext";
import { Badge } from "@/components/ui/badge";
import {
    Flame,
    Clock,
    Check,
    Users,
    Utensils,
    Volume2,
    Bell,
    Wine,
    Play,
    Square,
    RefreshCw,
    Zap
} from "lucide-react";

// Kitchen Tabs - Mixed Stations & Courses
// "Long Prep" filters for items > 15m old or generally slow items
const TABS = [
    "All",
    "Apps", "Mains", "Dessert", // Courses
    "Grill", "Sauté", "Fry", "Garde Manger", "Oven", "Pastry", "Bar", // Stations
    "Long Prep" // Special Filter
];

// Bartender section assignments (matches backend)
const BARTENDERS = [
    { id: "b1", name: "Alex", tables: Array.from({ length: 10 }, (_, i) => i + 1) },      // Tables 1-10
    { id: "b2", name: "Jordan", tables: Array.from({ length: 10 }, (_, i) => i + 11) },   // Tables 11-20
    { id: "b3", name: "Taylor", tables: Array.from({ length: 10 }, (_, i) => i + 21) },   // Tables 21-30
    { id: "b4", name: "Casey", tables: Array.from({ length: 10 }, (_, i) => i + 31) },    // Tables 31-40
];

const getBartenderForTable = (tableNumber: number) => {
    return BARTENDERS.find(b => b.tables.includes(tableNumber)) || BARTENDERS[0];
};

const getTimeColor = (mins: number) => {
    if (mins >= 15) return 'text-ruby bg-ruby/20 animate-pulse-alert';
    if (mins >= 10) return 'text-gold bg-gold/20';
    return 'text-emerald bg-emerald/20';
};

const statusColors: Record<string, string> = {
    new: 'border-sapphire bg-sapphire/10',
    cooking: 'border-gold bg-gold/10',
    ready: 'border-emerald bg-emerald/10',
};

export default function KDSPage() {
    const { tickets, updateTicketStatus, bumpTicket, deliverTicket, startSystem, stopSystem, systemRunning, resetSystem, bumpItemsForStation, updateItemStatus } = useRestaurant();
    const [activeStation, setActiveStation] = useState("All");
    const [activeBartender, setActiveBartender] = useState<string | null>(null); // null = all bartenders
    const [now, setNow] = useState(Date.now());
    const [bumpedTicket, setBumpedTicket] = useState<string | null>(null);
    const [newTicketFlash, setNewTicketFlash] = useState<string | null>(null);

    // Update timer every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 10000);
        return () => clearInterval(interval);
    }, []);

    // Flash new tickets
    useEffect(() => {
        if (tickets.length > 0) {
            const newest = tickets[0];
            if (now - newest.createdAt < 5000) {
                setNewTicketFlash(newest.id);
                setTimeout(() => setNewTicketFlash(null), 2000);
            }
        }
    }, [tickets, now]);

    const getTicketTime = (createdAt: number) => Math.max(0, Math.floor((now - createdAt) / 60000));

    const handleBumpTicket = (ticketId: string) => {
        setBumpedTicket(ticketId);
        setTimeout(() => {
            if (activeStation === "All" || activeStation === "Long Prep") {
                bumpTicket(ticketId);
            } else {
                bumpItemsForStation(ticketId, activeStation);
            }
            setBumpedTicket(null);
        }, 300);
    };

    // A ticket is visible if it still has items that are NOT ready/delivered for the current filter
    const visibleTickets = tickets.filter(t => {
        if (t.status === 'delivered') return false;

        // In "All" view, show if status is NOT delivered
        if (activeStation === "All" || activeStation === "Long Prep") {
            return true;
        }

        // In station view, show if ANY item FOR THIS STATION is not ready
        return t.items.some(item => {
            const itemStation = (item.station || '').toLowerCase();
            const tab = activeStation.toLowerCase();
            const itemCourse = (item.course || '').toLowerCase();

            // Check if item belongs to this tab
            let isItemInTab = itemStation.includes(tab);
            if (!isItemInTab) {
                if (tab === 'apps' && (itemCourse.includes('app') || itemCourse.includes('starter'))) isItemInTab = true;
                if (tab === 'mains' && (itemCourse.includes('main') || itemCourse.includes('entree'))) isItemInTab = true;
                if (tab === 'dessert' && itemCourse.includes('dessert')) isItemInTab = true;
                if (tab === 'bar' && (itemCourse.includes('drink') || itemStation.includes('bar'))) isItemInTab = true;
            }

            return isItemInTab && item.status !== 'ready';
        });
    });

    // Apply station/course filter
    let filteredTickets = activeStation === "All"
        ? visibleTickets
        : activeStation === "Long Prep"
            ? visibleTickets.filter(t => {
                const mins = getTicketTime(t.createdAt);
                return mins >= 15; // Show tickets older than 15m
            })
            : visibleTickets.filter(t => t.items.some(i => {
                const itemStation = (i.station || '').toLowerCase();
                const itemCourse = (i.course || '').toLowerCase();
                const tab = activeStation.toLowerCase();

                // Direct station match
                if (itemStation.includes(tab)) return true;

                // Course mapping (tabs -> backend course names)
                if (tab === 'apps' && (itemCourse.includes('app') || itemCourse.includes('appetizer') || itemCourse.includes('starter'))) return true;
                if (tab === 'mains' && (itemCourse.includes('main') || itemCourse.includes('entree'))) return true;
                if (tab === 'dessert' && itemCourse.includes('dessert')) return true;
                if (tab === 'bar' && (itemCourse.includes('drink') || itemStation.includes('bar'))) return true;

                // Fallback: direct course match
                return itemCourse.includes(tab);
            }));

    // Additional filter by bartender section when Bar is selected
    if (activeStation === "Bar" && activeBartender) {
        const bartender = BARTENDERS.find(b => b.id === activeBartender);
        if (bartender) {
            filteredTickets = filteredTickets.filter(t =>
                bartender.tables.includes(t.tableNumber)
            );
        }
    }

    return (
        <div className="min-h-screen bg-void text-white">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-void/80 backdrop-blur-xl border-b border-white/5 px-8 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="p-3 rounded-xl bg-ruby/10 border border-ruby/20">
                                <Flame className="h-7 w-7 text-ruby animate-pulse" />
                            </div>
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-ruby rounded-full border-2 border-void animate-ping" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white flex items-center gap-2">
                                KDS <span className="text-muted-foreground opacity-50">Command</span>
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald/10 border border-emerald/20 text-[10px] font-black text-emerald uppercase tracking-widest">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
                                    Live
                                </span>
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                    {filteredTickets.length} ACTIVE MISSIONS
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Station Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {TABS.map((tab) => {
                            const count = tickets.filter(t => {
                                if (t.status === 'delivered') return false;
                                if (tab === "All") return true;
                                if (tab === "Long Prep") return (Date.now() - t.createdAt) > 15 * 60 * 1000;

                                return t.items.some(i => {
                                    const itemStation = i.station?.toLowerCase() || '';
                                    const itemCourse = i.course?.toLowerCase() || '';
                                    const tabLower = tab.toLowerCase();

                                    if (itemStation.includes(tabLower)) return i.status !== 'ready';
                                    if (tabLower === 'apps' && (itemCourse.includes('appetizer') || itemCourse.includes('starter'))) return i.status !== 'ready';
                                    if (tabLower === 'mains' && (itemCourse.includes('main') || itemCourse.includes('entree'))) return i.status !== 'ready';
                                    if (tabLower === 'dessert' && itemCourse.includes('dessert')) return i.status !== 'ready';
                                    if (tabLower === 'bar' && (itemCourse.includes('drink') || itemStation.includes('bar'))) return i.status !== 'ready';

                                    return (itemStation.includes(tabLower) || itemCourse.includes(tabLower)) && i.status !== 'ready';
                                });
                            }).length;

                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveStation(tab)}
                                    className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2.5 border-2 ${activeStation === tab
                                        ? 'bg-gold border-gold text-void shadow-[0_0_20px_rgba(212,168,83,0.3)]'
                                        : 'bg-void/40 border-white/5 text-muted-foreground hover:text-white hover:border-white/20'
                                        }`}
                                >
                                    {tab}
                                    {count > 0 && (
                                        <span className={`px-1.5 py-0.5 rounded bg-void/20 text-[9px] font-black`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Operational Controls & Dev Tools */}
                    <div className="flex items-center gap-4">
                        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-void/50 border border-white/5 mr-2">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mr-2 text-gold">Ops Tools</span>
                            <button
                                onClick={() => {
                                    const toFire = tickets.filter(t => t.status === 'new');
                                    toFire.forEach(t => updateTicketStatus(t.id, 'cooking'));
                                }}
                                className="p-1.5 rounded-lg hover:bg-gold/10 text-muted-foreground hover:text-gold transition-all"
                                title="Fire All"
                            >
                                <Flame className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => {
                                    const toReady = tickets.filter(t => t.status === 'new' || t.status === 'cooking');
                                    toReady.forEach(t => updateTicketStatus(t.id, 'ready'));
                                }}
                                className="p-1.5 rounded-lg hover:bg-amber-500/10 text-muted-foreground hover:text-amber-500 transition-all"
                                title="Ready All"
                            >
                                <Zap className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => {
                                    const toDeliver = tickets.filter(t => t.status === 'ready');
                                    toDeliver.forEach(t => deliverTicket(t.id));
                                }}
                                className="p-1.5 rounded-lg hover:bg-emerald/10 text-muted-foreground hover:text-emerald transition-all"
                                title="Deliver All"
                            >
                                <Check className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex items-center bg-void/50 rounded-xl border border-white/10 p-1 px-3 gap-4">
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Control</span>
                                {systemRunning ? (
                                    <button onClick={stopSystem} className="p-1 rounded-lg text-ruby hover:bg-ruby/10 transition-colors">
                                        <Square className="h-4 w-4 fill-current" />
                                    </button>
                                ) : (
                                    <button onClick={startSystem} className="p-1 rounded-lg text-emerald hover:bg-emerald/10 transition-colors">
                                        <Play className="h-4 w-4 fill-current" />
                                    </button>
                                )}
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Reset</span>
                                <button
                                    onClick={async () => {
                                        if (confirm("Reset all restaurant data? This cannot be undone.")) {
                                            await resetSystem();
                                        }
                                    }}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-ruby hover:bg-ruby/10 transition-colors"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Audio</span>
                                <button className="p-1.5 rounded-lg text-muted-foreground hover:text-white transition-colors">
                                    <Volume2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Bartender Sub-Tabs (only visible when Bar is selected) */}
            {activeStation === "Bar" && (
                <div className="sticky top-[76px] z-10 bg-charcoal/90 backdrop-blur-lg border-b border-white/5 px-6 py-3">
                    <div className="flex items-center gap-4">
                        <Wine className="h-5 w-5 text-gold" />
                        <span className="text-sm font-medium text-muted-foreground">Bartender:</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveBartender(null)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeBartender === null
                                    ? 'bg-gold text-void'
                                    : 'bg-slate text-muted-foreground hover:text-white'
                                    }`}
                            >
                                All
                            </button>
                            {BARTENDERS.map((bartender) => (
                                <button
                                    key={bartender.id}
                                    onClick={() => setActiveBartender(bartender.id)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeBartender === bartender.id
                                        ? 'bg-gold text-void'
                                        : 'bg-slate text-muted-foreground hover:text-white'
                                        }`}
                                >
                                    {bartender.name}
                                    <span className="ml-1 text-xs opacity-60">
                                        (T{bartender.tables[0]}-{bartender.tables[bartender.tables.length - 1]})
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Ticket Grid */}
            <main className="p-6 pb-24">
                {filteredTickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh]">
                        <div className="w-24 h-24 rounded-full bg-charcoal mx-auto mb-4 flex items-center justify-center">
                            <Utensils className="h-12 w-12 text-emerald" />
                        </div>
                        <p className="text-2xl font-bold text-emerald mb-2">All Clear!</p>
                        <p className="text-muted-foreground">No tickets waiting. Orders from tablet will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-4">
                        {filteredTickets.map((ticket) => {
                            const mins = getTicketTime(ticket.createdAt);
                            const isLate = mins >= 15;
                            const isBumping = bumpedTicket === ticket.id;
                            const isNew = newTicketFlash === ticket.id;

                            // Filter items to display based on active tab
                            const displayItems = activeStation === "All" || activeStation === "Long Prep"
                                ? ticket.items
                                : ticket.items.filter(i => {
                                    const itemStation = i.station?.toLowerCase() || '';
                                    const itemCourse = i.course?.toLowerCase() || '';
                                    const currentTab = activeStation.toLowerCase();

                                    // Direct Station Match (e.g. Grill, Fry, Oven)
                                    if (itemStation.includes(currentTab)) return true;

                                    // Course Mapping
                                    if (currentTab === 'apps' && (itemCourse.includes('appetizer') || itemCourse.includes('starter'))) return true;
                                    if (currentTab === 'mains' && (itemCourse.includes('main') || itemCourse.includes('entree'))) return true;
                                    if (currentTab === 'dessert' && itemCourse.includes('dessert')) return true;
                                    if (currentTab === 'bar' && (itemCourse.includes('drink') || itemStation.includes('bar'))) return true;

                                    // Fallback text match
                                    return itemStation.includes(currentTab) || itemCourse.includes(currentTab);
                                });

                            if (displayItems.length === 0) return null;

                            return (
                                <div
                                    key={ticket.id}
                                    className={`glass-card-elevated group relative flex flex-col transition-all duration-300 ${isBumping ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                                        } ${isLate ? 'animate-pulse-alert' : ''} ${isNew ? 'ring-2 ring-gold' : ''}`}
                                >
                                    {/* Urgency/Status Band */}
                                    <div className={`h-1.5 w-full ${isLate ? 'bg-ruby' : isNew ? 'bg-sapphire' : 'bg-gold'}`} />

                                    {/* Ticket Header */}
                                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-charcoal/30">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center justify-center bg-void/50 rounded-lg h-16 w-16 border border-white/10">
                                                <span className="text-4xl font-black tracking-tighter text-white leading-none">
                                                    {ticket.tableNumber}
                                                </span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Table</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-bold text-lg tracking-tight">{ticket.server}</span>
                                                    {ticket.priority === 'vip' && (
                                                        <Badge variant="vip" className="bg-gold text-void font-black px-1.5 py-0">VIP</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {isNew && (
                                                        <span className="flex items-center gap-1 text-[10px] font-black tracking-widest text-sapphire uppercase animate-pulse">
                                                            <Bell className="h-3 w-3" /> New
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Impact Timer */}
                                        <div className={`flex flex-col items-end`}>
                                            <div className={`px-3 py-1 rounded-md font-mono font-black text-2xl shadow-inner ${getTimeColor(mins).split(' ').find(c => c.startsWith('text-'))}`}>
                                                {mins}:{String(Math.floor((now - ticket.createdAt) / 1000) % 60).padStart(2, '0')}
                                            </div>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase mr-1 mt-0.5">Elapsed</span>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="p-4 flex-1 space-y-1">
                                        {displayItems.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className={`group/item px-3 py-2.5 rounded-lg border transition-all ${item.status === 'ready'
                                                    ? 'bg-emerald/5 border-emerald/20 opacity-60'
                                                    : 'bg-void/40 border-white/5 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className={`font-bold text-lg tracking-tight ${item.status === 'ready' ? 'line-through text-muted-foreground' : 'text-white'}`}>
                                                                {item.name}
                                                            </p>
                                                            {item.status === 'cooking' && (
                                                                <Flame className="h-4 w-4 text-gold animate-pulse" />
                                                            )}
                                                        </div>
                                                        {item.mods.length > 0 && (
                                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                                                {item.mods.map((mod, midx) => (
                                                                    <span key={midx} className="px-1.5 py-0.5 rounded bg-ruby/20 border border-ruby/30 text-ruby text-[11px] font-bold uppercase tracking-wider">
                                                                        {mod}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <Badge className={`text-[9px] font-black uppercase tracking-widest ${item.status === 'ready' ? 'bg-emerald/20 text-emerald' : 'bg-charcoal text-muted-foreground'
                                                            }`}>
                                                            {item.station}
                                                        </Badge>
                                                        {item.status === 'ready' && <Check className="h-4 w-4 text-emerald" />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Bar */}
                                    <div className="p-4 bg-charcoal/50 border-t border-white/5">
                                        {displayItems.every(i => i.status === 'ready') ? (
                                            <button
                                                onClick={() => handleBumpTicket(ticket.id)}
                                                className="w-full py-4 rounded-xl bg-emerald text-void font-black text-xl flex items-center justify-center gap-3 hover:bg-emerald/90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                            >
                                                <Check className="h-6 w-6 stroke-[3]" />
                                                COMPLETE TICKET
                                            </button>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => {
                                                        displayItems.forEach(item => {
                                                            if (item.status === 'new') updateItemStatus(ticket.id, item.id, 'cooking');
                                                        });
                                                    }}
                                                    className={`py-3 rounded-lg font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${displayItems.every(i => i.status === 'cooking')
                                                        ? 'bg-gold/10 border-2 border-gold/40 text-gold shadow-[0_0_15px_rgba(212,168,83,0.2)]'
                                                        : 'bg-void text-white border-2 border-white/10 hover:border-gold/50'
                                                        }`}
                                                >
                                                    <Flame className="h-4 w-4" />
                                                    {displayItems.every(i => i.status === 'cooking') ? 'In Progress' : 'Fire Station'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        displayItems.forEach(item => {
                                                            updateItemStatus(ticket.id, item.id, 'ready');
                                                        });
                                                    }}
                                                    className="py-3 rounded-lg bg-emerald/10 border-2 border-emerald/40 text-emerald font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald/20 active:scale-[0.98] transition-all"
                                                >
                                                    <Check className="h-4 w-4" />
                                                    All Ready
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Stats Bar */}
            <footer className="fixed bottom-0 left-0 right-0 bg-void/80 backdrop-blur-xl border-t border-white/5 px-8 py-4 z-40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Avg Ticket Time</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white font-mono tracking-tighter">
                                    {tickets.length > 0
                                        ? `${Math.floor(tickets.reduce((sum, t) => sum + getTicketTime(t.createdAt), 0) / tickets.length)}:00`
                                        : '--:--'}
                                </span>
                                <span className="text-[10px] font-bold text-emerald uppercase tracking-widest">In Range</span>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-white/5" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Active Missions</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white font-mono tracking-tighter">{tickets.length}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tickets</span>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-white/5" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Critical Delay</span>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-3xl font-black font-mono tracking-tighter ${tickets.filter(t => getTicketTime(t.createdAt) >= 15).length > 0 ? 'text-ruby animate-pulse' : 'text-emerald'}`}>
                                    {tickets.filter(t => getTicketTime(t.createdAt) >= 15).length}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{'>'}15M</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Station Telemetry</span>
                            <div className="flex items-center gap-4 text-emerald font-black text-[11px] tracking-widest uppercase italic">
                                <span>Grill Op: {tickets.filter(t => t.items.some(i => i.station.toLowerCase() === 'grill')).length}</span>
                                <div className="h-1 w-1 rounded-full bg-emerald" />
                                <span>Bar Op: {tickets.filter(t => t.items.some(i => i.station.toLowerCase() === 'bar')).length}</span>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-white/5" />
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-void/50 border border-white/10">
                            <Clock className="h-5 w-5 text-gold" />
                            <span className="text-xl font-black text-white font-mono tracking-tighter">
                                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

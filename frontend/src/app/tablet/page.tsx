'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { GuestProfileCard } from "@/components/tablet/GuestProfileCard"
import { useRestaurant, KitchenTicket, TableData } from "@/context/RestaurantContext"
import {
    Plus,
    Minus,
    Send,
    ChefHat,
    Sparkles,
    Wine,
    Clock,
    Users,
    X,
    Flame,
    AlertTriangle,
    DollarSign,
    Star,
    Timer,
    MessageSquare,
    Zap,
    RotateCcw,
    Check,
    Bell,
    RefreshCw,
    Play,
    Square
} from "lucide-react";

// Server profiles - Tables assigned round-robin (Maria gets 1,6,11,16,21,26,31,36)
const SERVERS = [
    { id: "srv1", name: "Maria Garcia", section: "1, 6, 11, 16, 21, 26, 31, 36", avatar: "MG" },
    { id: "srv2", name: "James Wilson", section: "2, 7, 12, 17, 22, 27, 32, 37", avatar: "JW" },
    { id: "srv3", name: "Sarah Jones", section: "3, 8, 13, 18, 23, 28, 33, 38", avatar: "SJ" },
    { id: "srv4", name: "David Miller", section: "4, 9, 14, 19, 24, 29, 34, 39", avatar: "DM" },
    { id: "srv5", name: "Michael Brown", section: "5, 10, 15, 20, 25, 30, 35, 40", avatar: "MB" },
    // Bartenders - each covers 10 tables for drink delivery
    { id: "bar1", name: "Bartender 1", section: "Tables 1-10", avatar: "B1", role: "bartender" },
    { id: "bar2", name: "Bartender 2", section: "Tables 11-20", avatar: "B2", role: "bartender" },
    { id: "bar3", name: "Bartender 3", section: "Tables 21-30", avatar: "B3", role: "bartender" },
    { id: "bar4", name: "Bartender 4", section: "Tables 31-40", avatar: "B4", role: "bartender" },
];

import { MENU_CATEGORIES, MenuItem } from "@/lib/data/menu";

// Mock Guest Profile
const MOCK_GUEST = {
    id: "g1",
    name: "Michael Johnson",
    isVip: true,
    visitCount: 12,
    lastVisit: "Jan 15, 2026",
    preferences: ["Corner booth", "Medium-rare steaks"],
    allergies: ["Shellfish"],
    favoriteWine: "2018 Caymus Cabernet",
    averageSpend: 285,
    notes: "Anniversary dinner tonight. Mentioned proposing."
};

// AI Recommendations - contextual
const getAIRecommendations = (cart: any[], table: any) => {
    const recs = [];

    // Wine pairing
    if (cart.some(i => i.name.includes("Ribeye"))) {
        recs.push({ text: "Pair with Caymus Cabernet", reason: "Classic steak pairing", icon: Wine, type: "pairing" });
    }

    // Upsell
    if (cart.some(i => i.name.includes("Ribeye"))) {
        recs.push({ text: "Offer truffle butter (+$8)", reason: "68% accept rate", icon: DollarSign, type: "upsell" });
    }

    // Timing
    if (cart.some(i => i.name.includes("Souffle"))) {
        recs.push({ text: "Fire souffle with mains", reason: "25 min prep time", icon: Timer, type: "timing" });
    }

    // VIP guest
    if (table?.isVip) {
        recs.push({ text: "Comp amuse-bouche", reason: "VIP guest - anniversary", icon: Star, type: "vip" });
    }

    // Default
    if (recs.length === 0) {
        recs.push({ text: "Suggest truffle fries", reason: "Best-selling side", icon: Flame, type: "popular" });
    }

    return recs;
};

type CourseStatus = 'pending' | 'ready' | 'fired' | 'completed';

export default function TabletPage() {
    const [currentServer, setCurrentServer] = useState<typeof SERVERS[0] | null>(null);

    // Load server from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('hospitality_server');
        if (saved) {
            try {
                setCurrentServer(JSON.parse(saved));
            } catch (e) { console.error("Failed to load server profile", e); }
        }
    }, []);

    const handleLogin = (server: typeof SERVERS[0]) => {
        setCurrentServer(server);
        localStorage.setItem('hospitality_server', JSON.stringify(server));
    };

    const handleLogout = () => {
        setCurrentServer(null);
        localStorage.removeItem('hospitality_server');
    };
    const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
    const { tickets, tables, seatTable, clearTable, deliverTicket, bumpTicket, resetSystem, startSystem, stopSystem, systemRunning, addTicket, updateTableData } = useRestaurant();

    // Filter tables for current server (mock logic: match server name)
    const myTables = currentServer
        ? tables.filter(t => t.server === currentServer.name.split(' ')[0]) // Match first name as stored in backend/context
        : [];

    const [cart, setCart] = useState<any[]>([]);
    const [sending, setSending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showCloseout, setShowCloseout] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [courseStatuses, setCourseStatuses] = useState<Record<string, CourseStatus>>({
        appetizer: 'pending',
        main: 'pending',
        dessert: 'pending'
    });
    const [now, setNow] = useState(Date.now());

    // Update timer every minute
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    const getTimeSeated = (seatedAt: number | null) => {
        if (!seatedAt) return null;
        const mins = Math.floor((now - seatedAt) / 60000);
        return mins;
    };

    const addToCart = (item: any) => {
        setCart([...cart, { ...item, uniqueId: Math.random().toString(36) }]);
        if (courseStatuses[item.course] === 'pending') {
            setCourseStatuses(prev => ({ ...prev, [item.course]: 'ready' }));
        }
    };

    const removeFromCart = (uniqueId: string) => {
        setCart(cart.filter(i => i.uniqueId !== uniqueId));
    };

    const fireCourse = (course: string) => {
        setCourseStatuses(prev => ({ ...prev, [course]: 'fired' }));
    };


    // Get table data from shared state
    const getTableFromContext = (tableNumber: number) => {
        return tables.find(t => t.number === tableNumber);
    };

    const submitOrder = async () => {
        if (cart.length === 0 || !selectedTable || !currentServer) return;
        setSending(true);

        // Create kitchen ticket
        const ticket: KitchenTicket = {
            id: `tkt-${Date.now()}`,
            tableNumber: selectedTable.number,
            server: currentServer.name.split(' ')[0],
            createdAt: Date.now(),
            status: 'new',
            priority: selectedTable.isVip ? 'vip' : undefined,
            items: cart.map(item => ({
                id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                name: item.name,
                mods: [],
                station: item.station.charAt(0).toUpperCase() + item.station.slice(1),
                status: 'new' as const,
                price: item.price,
                course: item.course
            }))
        };

        // Determine next course
        let nextCourse = selectedTable.currentCourse || 'seated';
        const hasDrinks = cart.some(i => i.course === 'drink');
        const hasApps = cart.some(i => i.course === 'appetizer');
        const hasMains = cart.some(i => i.course === 'main');
        const hasDessert = cart.some(i => i.course === 'dessert');

        if (hasDessert) nextCourse = 'dessert';
        else if (hasMains) nextCourse = 'mains';
        else if (hasApps) nextCourse = 'apps';
        else if (hasDrinks && nextCourse === 'seated') nextCourse = 'drinks';

        // Update Context
        await new Promise(resolve => setTimeout(resolve, 500));
        addTicket(ticket);

        updateTableData(selectedTable.id, {
            currentCourse: nextCourse,
            orderTotal: (selectedTable.orderTotal || 0) + cart.reduce((sum, i) => sum + i.price, 0),
            items: [...(selectedTable.items || []), ...cart.map(i => i.name)]
        });

        // Clear local state
        setCart([]);
        setCourseStatuses({ appetizer: 'pending', main: 'pending', dessert: 'pending' });
        setSending(false);
        setShowSuccess(true);
        setSelectedTable(prev => prev ? {
            ...prev,
            currentCourse: nextCourse,
            orderTotal: (prev.orderTotal || 0) + cart.reduce((sum, i) => sum + i.price, 0),
            items: [...(prev.items || []), ...cart.map(i => i.name)]
        } : null);

        setTimeout(() => setShowSuccess(false), 2000);
    };

    const closeTab = async (paymentMethod: string) => {
        if (!selectedTable) return;
        setProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Clear the table in shared context
        const tableFromContext = tables.find(t => t.number === selectedTable.number);
        if (tableFromContext) {
            clearTable(tableFromContext.id);
        }

        setProcessing(false);
        setShowCloseout(false);
        setSelectedTable(null);
        setShowSuccess(true);

        setTimeout(() => setShowSuccess(false), 2500);
    };

    const cartByCourse = cart.reduce((acc, item) => {
        const course = item.course || 'other';
        if (!acc[course]) acc[course] = [];
        acc[course].push(item);
        return acc;
    }, {} as Record<string, any[]>);

    const aiRecs = getAIRecommendations(cart, selectedTable);

    // Server Login Screen
    if (!currentServer) {
        return (
            <div className="flex h-screen bg-void items-center justify-center">
                <div className="text-center animate-fade-in">
                    <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
                        <ChefHat className="h-10 w-10 text-gold" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">HOSPITALITY</h1>
                    <p className="text-muted-foreground mb-8">Select your profile to begin</p>

                    <div className="flex gap-4 justify-center">
                        {SERVERS.map((server) => (
                            <button
                                key={server.id}
                                onClick={() => handleLogin(server)}
                                className="glass-card-elevated p-6 hover:border-gold/30 transition-all hover:scale-105 active:scale-95"
                            >
                                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-3 text-gold font-bold text-xl">
                                    {server.avatar}
                                </div>
                                <p className="font-semibold text-white">{server.name}</p>
                                <p className="text-sm text-muted-foreground">Tables {server.section}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Table Selection Screen
    if (!selectedTable) {
        return (
            <div className="flex h-screen bg-void">
                {/* Sidebar */}
                <aside className="w-80 border-r border-white/5 bg-charcoal/50 p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
                            {currentServer.avatar}
                        </div>
                        <div>
                            <p className="font-semibold text-white">{currentServer.name}</p>
                            <p className="text-sm text-muted-foreground">Tables {currentServer.section}</p>
                        </div>
                    </div>

                    {/* Section Stats */}
                    <div className="space-y-4 mb-8">
                        {/* Ready Orders Alert */}
                        {(() => {
                            const isBartender = (currentServer as any).role === 'bartender';

                            // Determine which tickets to show
                            const readyTickets = tickets.filter(t => {
                                if (t.status !== 'ready') return false;

                                if (isBartender) {
                                    // Bartenders see drinks ready for tables in their section
                                    const hasDrinks = t.items.some(i => i.course?.toLowerCase() === 'drink' || i.station?.toLowerCase() === 'bar');
                                    if (!hasDrinks) return false;

                                    // Check if table is in bartender's section
                                    const tableNum = t.tableNumber;
                                    if (currentServer.id === 'bar1') return tableNum >= 1 && tableNum <= 10;
                                    if (currentServer.id === 'bar2') return tableNum >= 11 && tableNum <= 20;
                                    if (currentServer.id === 'bar3') return tableNum >= 21 && tableNum <= 30;
                                    if (currentServer.id === 'bar4') return tableNum >= 31 && tableNum <= 40;
                                    return false;
                                } else {
                                    // Servers see their own orders
                                    return t.server === currentServer.name.split(' ')[0];
                                }
                            });

                            if (readyTickets.length === 0) return null;

                            return (
                                <div className="p-4 rounded-xl bg-emerald/20 border border-emerald/50 animate-pulse-alert">
                                    <h3 className="text-emerald font-bold mb-2 flex items-center gap-2">
                                        <Bell className="h-4 w-4" /> {isBartender ? 'Drinks Ready for Pickup' : 'Ready for Pickup'}
                                    </h3>
                                    <div className="space-y-2">
                                        {readyTickets.map(ticket => (
                                            <div key={ticket.id} className="bg-void/50 p-2 rounded flex justify-between items-center">
                                                <div>
                                                    <span className="font-bold text-white block">Table {ticket.tableNumber}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {isBartender
                                                            ? `${ticket.items.filter(i => i.course?.toLowerCase() === 'drink' || i.station?.toLowerCase() === 'bar').map(i => i.name).join(', ')}`
                                                            : `Server: ${ticket.server}`
                                                        }
                                                    </span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="h-7 bg-emerald hover:bg-emerald/90 text-white border-0"
                                                    onClick={() => deliverTicket(ticket.id)}
                                                >
                                                    {isBartender ? 'Delivered' : 'Deliver'}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* AI Insights Ticker */}
                        <div className="glass-card p-4 overflow-hidden relative">
                            <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-gold" /> Live Insights
                            </h3>
                            <div className="flex flex-col gap-2">
                                {tickets.filter(t => t.status === 'ready' && t.server === currentServer.name.split(' ')[0]).length > 0 && (
                                    <div className="text-xs font-bold text-emerald flex items-center gap-2 animate-pulse">
                                        <Bell className="h-3 w-3" /> Orders Ready for Pickup
                                    </div>
                                )}
                                <div className="h-16 overflow-hidden relative">
                                    <div className="space-y-2 animate-slide-up-infinite">
                                        {useRestaurant().notifications.slice(0, 3).map((note, i) => (
                                            <p key={i} className="text-xs text-white/80 truncate border-l-2 border-gold/50 pl-2">
                                                {note}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm">Tonight's Sales</span>
                                <span className="text-2xl font-bold text-gold font-mono">$929</span>
                            </div>
                        </div>
                        <div className="glass-card p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm">Active Tables</span>
                                <span className="text-2xl font-bold text-white">{myTables.filter(t => t.status === 'occupied').length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-auto">
                        <Button
                            variant="outline"
                            className="w-full mb-2"
                            onClick={handleLogout}
                        >
                            Switch Server
                        </Button>
                    </div>
                </aside>

                {/* Table Grid */}
                <main className="flex-1 p-8">
                    <header className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                {(currentServer as any).role === 'bartender' ? 'Drink Orders' : 'All Tables'}
                            </h1>
                            <p className="text-muted-foreground">
                                {(currentServer as any).role === 'bartender'
                                    ? 'Tables with drinks ready for delivery'
                                    : 'Select a table to start order'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {/* Testing Buttons */}
                            <Button
                                variant="outline"
                                className="bg-gold/10 border-gold/30 text-gold hover:bg-gold/20"
                                onClick={() => {
                                    const toBump = tickets.filter(t => t.status === 'new' || t.status === 'cooking');
                                    toBump.forEach(t => bumpTicket(t.id));
                                }}
                            >
                                <Zap className="mr-2 h-4 w-4" />
                                Fire All ({tickets.filter(t => t.status === 'new' || t.status === 'cooking').length})
                            </Button>
                            <Button
                                variant="outline"
                                className="bg-emerald/10 border-emerald/30 text-emerald hover:bg-emerald/20"
                                onClick={() => {
                                    const toDeliver = tickets.filter(t => t.status === 'ready');
                                    toDeliver.forEach(t => deliverTicket(t.id));
                                }}
                            >
                                <Check className="mr-2 h-4 w-4" />
                                Deliver All ({tickets.filter(t => t.status === 'ready').length})
                            </Button>
                            <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => window.location.reload()}>
                                <RefreshCw className="mr-2 h-4 w-4" /> Force Sync
                            </Button>
                            <div className="flex gap-2 border-l border-white/5 pl-2 ml-1">
                                {systemRunning ? (
                                    <Button
                                        variant="outline"
                                        className="bg-ruby/10 border-ruby/30 text-ruby hover:bg-ruby/20 border-0"
                                        onClick={stopSystem}
                                    >
                                        <Square className="mr-2 h-4 w-4 fill-current" /> Stop Service
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="bg-emerald/10 border-emerald/30 text-emerald hover:bg-emerald/20 border-0"
                                        onClick={startSystem}
                                    >
                                        <Play className="mr-2 h-4 w-4 fill-current" /> Run Service
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        if (confirm("Reset everything for a new shift? This cannot be undone.")) {
                                            resetSystem();
                                        }
                                    }}
                                    className="text-muted-foreground hover:text-white"
                                    title="Reset Shift"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </header>

                    {/* Bartender View - Tables with Ready Drinks */}
                    {(currentServer as any).role === 'bartender' ? (
                        (() => {
                            // Get tables with ready drinks in bartender's section
                            const bartenderTickets = tickets.filter(t => {
                                if (t.status !== 'ready') return false;
                                const hasDrinks = t.items.some(i => i.course?.toLowerCase() === 'drink' || i.station?.toLowerCase() === 'bar');
                                if (!hasDrinks) return false;

                                const tableNum = t.tableNumber;
                                if (currentServer.id === 'bar1') return tableNum >= 1 && tableNum <= 10;
                                if (currentServer.id === 'bar2') return tableNum >= 11 && tableNum <= 20;
                                if (currentServer.id === 'bar3') return tableNum >= 21 && tableNum <= 30;
                                if (currentServer.id === 'bar4') return tableNum >= 31 && tableNum <= 40;
                                return false;
                            });

                            if (bartenderTickets.length === 0) {
                                return (
                                    <div className="flex flex-col items-center justify-center h-96 text-center">
                                        <div className="w-24 h-24 rounded-full bg-emerald/10 flex items-center justify-center mb-6">
                                            <Check className="h-12 w-12 text-emerald" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2">All Caught Up!</h2>
                                        <p className="text-muted-foreground">No drinks ready for delivery in your section</p>
                                        <p className="text-sm text-muted-foreground/50 mt-2">{currentServer.section}</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="grid grid-cols-2 gap-6">
                                    {bartenderTickets.map(ticket => {
                                        const drinkItems = ticket.items.filter(i =>
                                            i.course?.toLowerCase() === 'drink' || i.station?.toLowerCase() === 'bar'
                                        );

                                        return (
                                            <div
                                                key={ticket.id}
                                                className="relative p-8 rounded-2xl border-2 border-emerald/50 bg-emerald/10 animate-pulse-alert"
                                            >
                                                {/* Table Number Badge */}
                                                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-emerald flex items-center justify-center shadow-lg shadow-emerald/30">
                                                    <span className="text-2xl font-bold text-void">{ticket.tableNumber}</span>
                                                </div>

                                                <div className="flex items-start gap-4 mb-6">
                                                    <div className="w-14 h-14 rounded-xl bg-gold/20 flex items-center justify-center">
                                                        <Wine className="h-7 w-7 text-gold" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white">Table {ticket.tableNumber}</h3>
                                                        <p className="text-emerald font-medium">Drinks Ready!</p>
                                                    </div>
                                                </div>

                                                {/* Drink Items */}
                                                <div className="space-y-2 mb-6">
                                                    {drinkItems.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-void/50">
                                                            <div className="w-2 h-2 rounded-full bg-gold" />
                                                            <span className="text-white font-medium">{item.name}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Action Button */}
                                                <Button
                                                    className="w-full h-14 text-lg bg-emerald hover:bg-emerald/90 text-void font-bold"
                                                    onClick={() => deliverTicket(ticket.id)}
                                                >
                                                    <Check className="mr-2 h-5 w-5" /> Mark Delivered
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()
                    ) : (
                        /* Server View - All Tables */
                        <div className="grid grid-cols-3 gap-6">
                            {myTables.map((table) => {
                                const timeSeated = getTimeSeated(table.seatedAt || 0);
                                const isLong = timeSeated && timeSeated > 60;

                                return (
                                    <button
                                        key={table.id}
                                        onClick={() => table.status !== 'available' && setSelectedTable(table)}
                                        disabled={table.status === 'available'}
                                        className={`relative p-6 rounded-2xl border-2 text-left transition-all ${table.status === 'available'
                                            ? 'border-emerald/30 bg-emerald/5 opacity-60'
                                            : isLong
                                                ? 'border-ruby/50 bg-ruby/10 hover:border-ruby animate-pulse-alert'
                                                : 'glass-card-elevated hover:border-gold/30 hover:scale-[1.02] active:scale-[0.98]'
                                            }`}
                                    >
                                        {/* Table Number */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="text-4xl font-bold text-white">{table.number}</div>
                                            {table.isVip && (
                                                <Badge variant="vip"><Star className="h-3 w-3 mr-1" />VIP</Badge>
                                            )}
                                        </div>

                                        {table.status === 'available' ? (
                                            <p className="text-emerald font-medium">Available</p>
                                        ) : (
                                            <>
                                                <p className="font-semibold text-white mb-1">{table.guestName}</p>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" /> {table.guestCount || 0}
                                                    </span>
                                                    {timeSeated && (
                                                        <span className={`flex items-center gap-1 ${isLong ? 'text-ruby' : ''}`}>
                                                            <Timer className="h-3 w-3" /> {timeSeated}m
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Course Status */}
                                                <div className="flex gap-2 mb-3">
                                                    {['drinks', 'apps', 'mains', 'dessert'].map((course) => (
                                                        <div
                                                            key={course}
                                                            className={`flex-1 h-1.5 rounded-full ${table.currentCourse === course ? 'bg-gold' :
                                                                ['drinks', 'apps', 'mains', 'dessert'].indexOf(table.currentCourse || '') > ['drinks', 'apps', 'mains', 'dessert'].indexOf(course)
                                                                    ? 'bg-emerald' : 'bg-charcoal'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>

                                                {/* Total */}
                                                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                                    <span className="text-xs text-muted-foreground uppercase">{table.currentCourse || 'Seated'}</span>
                                                    <span className="text-lg font-bold text-gold font-mono">${(table.orderTotal || 0).toFixed(2)}</span>
                                                </div>
                                            </>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        );
    }

    // Order Taking Screen
    return (
        <div className="flex h-screen bg-void text-white overflow-hidden">
            {/* Success Animation Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm animate-fade-in">
                    <div className="text-center animate-slide-up">
                        <div className="w-24 h-24 rounded-full bg-emerald/20 flex items-center justify-center mx-auto mb-4">
                            <Check className="h-12 w-12 text-emerald" />
                        </div>
                        <p className="text-2xl font-bold text-white">Order Sent!</p>
                        <p className="text-muted-foreground">Kitchen has been notified</p>
                    </div>
                </div>
            )}

            {/* Left Sidebar: Table Info + Guest Profile */}
            <aside className="w-80 border-r border-white/5 bg-charcoal/50 p-6 flex flex-col overflow-y-auto">
                {/* Back Button */}
                <button
                    onClick={() => setSelectedTable(null)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-6"
                >
                    ← Back to tables
                </button>

                {/* Table Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="text-4xl font-bold text-gold">{selectedTable.number}</div>
                        <div>
                            <p className="font-semibold text-white">{selectedTable.guestName}</p>
                            <p className="text-sm text-muted-foreground">{selectedTable.guestCount || selectedTable.capacity} guests</p>
                        </div>
                    </div>
                    {selectedTable.isVip && <Badge variant="vip">VIP</Badge>}
                </div>

                {/* Timer */}
                {selectedTable.seatedAt && (
                    <div className="glass-card p-3 mb-4 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Time Seated</span>
                        <span className={`font-mono font-bold ${getTimeSeated(selectedTable.seatedAt || 0)! > 60 ? 'text-ruby' : 'text-white'}`}>
                            {getTimeSeated(selectedTable.seatedAt || 0)}m
                        </span>
                    </div>
                )}

                {/* Guest Profile */}
                {selectedTable.isVip && (
                    <div className="mb-6">
                        <GuestProfileCard
                            guest={{
                                ...MOCK_GUEST,
                                name: selectedTable.guestName || MOCK_GUEST.name
                            }}
                        />
                    </div>
                )}

                {/* AI Recommendations */}
                <div className="mb-6">
                    <h3 className="text-xs text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-gold" />
                        AI Suggestions
                    </h3>
                    <div className="space-y-2">
                        {aiRecs.map((rec, i) => (
                            <button
                                key={i}
                                className={`w-full text-left p-3 rounded-lg border transition-colors ${rec.type === 'upsell' ? 'bg-gold/10 border-gold/30 hover:bg-gold/20' :
                                    rec.type === 'vip' ? 'bg-sapphire/10 border-sapphire/30 hover:bg-sapphire/20' :
                                        'bg-charcoal border-white/10 hover:bg-slate'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <rec.icon className={`h-4 w-4 mt-0.5 ${rec.type === 'upsell' ? 'text-gold' :
                                        rec.type === 'vip' ? 'text-sapphire' : 'text-muted-foreground'
                                        }`} />
                                    <div>
                                        <p className="text-sm font-medium text-white">{rec.text}</p>
                                        <p className="text-xs text-muted-foreground">{rec.reason}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="mt-auto">
                    <div className="glass-card-elevated p-4 mb-4">
                        <div className="flex justify-between mb-2 text-sm">
                            <span className="text-muted-foreground">Items</span>
                            <span className="font-semibold">{cart.length}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-bold">
                            <span>Total</span>
                            <span className="text-gold font-mono">${(cart.reduce((sum, i) => sum + i.price, 0) + (selectedTable.orderTotal || 0)).toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Button
                            className="w-full h-14 text-lg font-semibold bg-emerald hover:bg-emerald/90 text-void"
                            onClick={submitOrder}
                            disabled={cart.length === 0 || sending}
                        >
                            {sending ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-5 w-5 border-2 border-void/30 border-t-void rounded-full animate-spin" />
                                    Sending...
                                </span>
                            ) : (
                                <>Send to Kitchen <Send className="ml-2 h-5 w-5" /></>
                            )}
                        </Button>
                        <Button
                            className="w-full h-12 font-semibold bg-gold hover:bg-gold/90 text-void"
                            onClick={() => setShowCloseout(true)}
                        >
                            <DollarSign className="mr-2 h-5 w-5" />
                            Close Tab
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main: Menu */}
            <main className="flex-1 overflow-y-auto p-6">
                {/* Course Firing Bar */}
                <div className="flex gap-3 mb-6 p-4 glass-card rounded-xl">
                    <span className="text-sm text-muted-foreground uppercase tracking-wider self-center mr-4">Fire:</span>
                    {['appetizer', 'main', 'dessert'].map((course) => (
                        <button
                            key={course}
                            onClick={() => fireCourse(course)}
                            disabled={courseStatuses[course] !== 'ready'}
                            className={`fire-button ${courseStatuses[course]}`}
                        >
                            <Flame className={`h-4 w-4 mr-2 ${courseStatuses[course] === 'fired' ? 'text-emerald' : ''}`} />
                            {course === 'appetizer' ? 'Apps' : course === 'main' ? 'Mains' : 'Desserts'}
                            {courseStatuses[course] === 'fired' && ' ✓'}
                        </button>
                    ))}
                </div>

                {/* Menu Grid */}
                <div className="space-y-8">
                    {Object.entries(MENU_CATEGORIES).map(([category, items]) => (
                        <section key={category} className="animate-fade-in">
                            <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                                {category}
                                <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="menu-item-card p-4"
                                        onClick={() => addToCart(item)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="font-bold text-white">{item.name}</span>
                                            <span className="item-price">${item.price}</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="station">{item.station}</Badge>
                                            {item.popular && <Badge variant="vip">🔥 Popular</Badge>}
                                            {item.prepTime && <Badge variant="allergy">{item.prepTime}</Badge>}
                                            {item.upsell && (
                                                <Badge variant="new" className="text-[10px]">
                                                    <DollarSign className="h-3 w-3 mr-0.5" />{item.upsell}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>

            {/* Right Sidebar: Current Order */}
            <aside className="w-80 border-l border-white/5 bg-charcoal/30 p-4 overflow-y-auto">
                <h3 className="font-bold text-muted-foreground mb-4 px-2 uppercase tracking-wider text-sm">Current Order</h3>

                {cart.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <div className="w-16 h-16 rounded-full bg-charcoal mx-auto mb-4 flex items-center justify-center">
                            <ChefHat className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm">No items yet</p>
                        <p className="text-xs">Tap menu items to add</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {(Object.entries(cartByCourse) as [string, any[]][]).map(([course, items]) => (
                            <div key={course}>
                                <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
                                    <span>{course}s</span>
                                    <Badge variant={courseStatuses[course] === 'fired' ? 'returning' : 'station'} className="text-[10px]">
                                        {courseStatuses[course]}
                                    </Badge>
                                </h4>
                                <div className="space-y-2">
                                    {items.map((item: any) => (
                                        <div key={item.uniqueId} className="flex items-center justify-between p-3 glass-card group animate-fade-in">
                                            <div>
                                                <div className="font-medium text-sm">{item.name}</div>
                                                <div className="text-xs text-gold font-mono">${item.price.toFixed(2)}</div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-ruby/50 opacity-0 group-hover:opacity-100 hover:text-ruby hover:bg-ruby/10 transition-all"
                                                onClick={() => removeFromCart(item.uniqueId)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </aside>

            {/* Closeout Modal */}
            <Modal
                open={showCloseout}
                onClose={() => setShowCloseout(false)}
                title="Close Tab"
                size="md"
            >
                {selectedTable && (
                    <div className="space-y-6">
                        {/* Receipt Summary */}
                        <div className="glass-card p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Table</span>
                                <span className="font-semibold">{selectedTable.number} - {selectedTable.guestName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Guests</span>
                                <span>{selectedTable.guestCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Time Seated</span>
                                <span className="font-mono">{getTimeSeated(selectedTable.seatedAt || 0)}m</span>
                            </div>
                            <div className="border-t border-white/10 pt-3 mt-3">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Items</span>
                                    <span>—</span>
                                </div>
                                {selectedTable.items?.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm py-1">
                                        <span className="text-white">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-white/10 pt-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-mono">${(selectedTable.orderTotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax (8.25%)</span>
                                    <span className="font-mono">${((selectedTable.orderTotal || 0) * 0.0825).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold mt-2">
                                    <span>Total</span>
                                    <span className="text-gold font-mono">${((selectedTable.orderTotal || 0) * 1.0825).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Options */}
                        <div>
                            <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Payment Method</h4>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => closeTab('card')}
                                    disabled={processing}
                                    className="p-4 rounded-lg glass-card hover:border-gold/30 flex flex-col items-center gap-2 transition-all"
                                >
                                    <div className="text-2xl">💳</div>
                                    <span className="text-sm font-medium">Card</span>
                                </button>
                                <button
                                    onClick={() => closeTab('cash')}
                                    disabled={processing}
                                    className="p-4 rounded-lg glass-card hover:border-gold/30 flex flex-col items-center gap-2 transition-all"
                                >
                                    <div className="text-2xl">💵</div>
                                    <span className="text-sm font-medium">Cash</span>
                                </button>
                                <button
                                    onClick={() => closeTab('comp')}
                                    disabled={processing}
                                    className="p-4 rounded-lg glass-card hover:border-gold/30 flex flex-col items-center gap-2 transition-all"
                                >
                                    <div className="text-2xl">🎁</div>
                                    <span className="text-sm font-medium">Comp</span>
                                </button>
                            </div>
                        </div>

                        {/* Processing State */}
                        {processing && (
                            <div className="text-center py-4">
                                <div className="h-8 w-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-2" />
                                <p className="text-muted-foreground text-sm">Processing payment...</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

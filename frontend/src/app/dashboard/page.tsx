"use client";

import { useState, useEffect, Suspense } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { FloorPlanView } from "@/components/dashboard/FloorPlanView";


import { Sparkline } from "@/components/ui/sparkline";
import { Badge } from "@/components/ui/badge";
import {
    DollarSign,
    Users,
    Clock,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Sparkles,
    ChefHat,
    Utensils,

    Zap,
    RefreshCw,
    Play,
    Square,
    Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock metrics with sparkline data
// Initial Metrics State
const INITIAL_METRICS = [
    { label: "Revenue", value: 0, previous: 0, format: "currency", icon: DollarSign, color: "gold", data: [] as number[], isLive: true },
    { label: "Covers", value: 0, previous: 0, format: "number", icon: Users, color: "sapphire", data: [] as number[] },
    { label: "Avg Turn", value: 0, previous: 0, format: "minutes", icon: Clock, color: "emerald", data: [] as number[] },
    { label: "Wait Time", value: 0, previous: 0, format: "minutes", icon: Clock, color: "gold", data: [] as number[] }
];

// Kitchen Queue Initial State
const INITIAL_KITCHEN = [
    { station: "Grill", tickets: 0, avgTime: "0:00", status: "normal" },
    { station: "Sauté", tickets: 0, avgTime: "0:00", status: "normal" },
    { station: "Garde Manger", tickets: 0, avgTime: "0:00", status: "normal" },
    { station: "Pastry", tickets: 0, avgTime: "0:00", status: "normal" },
    { station: "Bar", tickets: 0, avgTime: "0:00", status: "normal" },
];

export default function DashboardPage() {
    const { tables, tickets, resetSystem, bumpTicket, deliverTicket, startSystem, stopSystem, systemRunning, updateTicketStatus } = useRestaurant();
    const [metrics, setMetrics] = useState(INITIAL_METRICS);
    const [insights, setInsights] = useState<any[]>([]);
    const [kitchenQueue, setKitchenQueue] = useState(INITIAL_KITCHEN);
    const [pulseRevenue, setPulseRevenue] = useState(false);

    // Calculate Real-Time Metrics & Insights
    useEffect(() => {
        if (!tables || !tickets) return;

        // 1. Revenue
        const totalRevenue = tables.reduce((sum, t) => sum + (t.orderTotal || 0), 0);

        // 2. Covers
        const totalCovers = tables.reduce((sum, t) => sum + (t.guestCount || 0), 0);

        // 3. Avg Turn (Mock logic for now as we don't track full history yet)
        const avgTurn = 45;

        // 4. Wait Time (Waitlist size * 5m)
        const waitTime = tables.filter(t => t.status === 'occupied').length > 35 ? 45 : 15;

        // Update Metrics
        setMetrics(prev => [
            { ...prev[0], value: totalRevenue, data: [...prev[0].data.slice(-10), totalRevenue] },
            { ...prev[1], value: totalCovers, data: [...prev[1].data.slice(-10), totalCovers] },
            { ...prev[2], value: avgTurn },
            { ...prev[3], value: waitTime }
        ]);

        if (totalRevenue > metrics[0].value) {
            setPulseRevenue(true);
            setTimeout(() => setPulseRevenue(false), 500);
        }

        // Generate Live AI Insights
        const newInsights = [];

        // VIP Checks
        const vips = tables.filter(t => t.isVip && t.status === 'occupied');
        if (vips.length > 0) {
            newInsights.push({
                type: "opportunity",
                message: `${vips.length} VIP tables currently seated`,
                action: "Ensure manager touches Table " + vips[0].number,
                priority: "high"
            });
        }

        // Long Wait Checks
        const longWaits = tables.filter(t => t.status === 'occupied' && t.orderTotal === 0); // Sat but no order
        if (longWaits.length > 2) {
            newInsights.push({
                type: "warning",
                message: `${longWaits.length} tables seated > 5m without orders`,
                action: "Check on server sections",
                priority: "high"
            });
        }

        // Revenue Milestones
        if (totalRevenue > 5000) {
            newInsights.push({
                type: "success",
                message: "Shift revenue target (5k) exceeded",
                action: null,
                priority: "low"
            });
        }

        // Kitchen Load
        const openTickets = tickets.filter(t => t.status !== 'delivered');
        if (openTickets.length > 10) {
            newInsights.push({
                type: "warning",
                message: "High kitchen volume detected",
                action: "Throttle seating if possible",
                priority: "medium"
            });
        }

        setInsights(newInsights);

        // Kitchen Queue Stats
        const stationCounts: Record<string, number> = { "Grill": 0, "Sauté": 0, "Garde Manger": 0, "Pastry": 0, "Bar": 0 };
        openTickets.forEach(t => {
            t.items.forEach(i => {
                if (stationCounts[i.station] !== undefined) stationCounts[i.station]++;
            });
        });

        setKitchenQueue(prev => prev.map(s => ({
            ...s,
            tickets: stationCounts[s.station] || 0,
            status: (stationCounts[s.station] || 0) > 5 ? 'busy' : 'normal'
        })));


    }, [tables, tickets]); // Re-run whenever restaurant state changes

    const formatValue = (value: number, format: string) => {
        if (format === "currency") return `$${value.toLocaleString()}`;
        if (format === "minutes") return `${value}m`;
        return value.toString();
    };

    const getTrend = (current: number, previous: number) => {
        const diff = ((current - previous) / previous) * 100;
        return { value: Math.abs(diff).toFixed(1), positive: diff > 0 };
    };

    return (
        <div className="flex min-h-screen bg-void">
            <Sidebar />

            <main className="flex-1 ml-20 p-8">
                {/* Header */}
                <header className="mb-8 flex items-center justify-between animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
                        <p className="text-muted-foreground">Friday Evening Service</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Testing Buttons */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                // Fire All: Move new tickets to cooking
                                const toFire = tickets.filter(t => t.status === 'new');
                                toFire.forEach(t => updateTicketStatus(t.id, 'cooking'));
                            }}
                            className="bg-gold/10 border-gold/30 text-gold hover:bg-gold/20"
                        >
                            <Flame className="h-4 w-4 mr-2" />
                            Fire All ({tickets.filter(t => t.status === 'new').length})
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                // Ready All: Move new/cooking tickets to ready
                                const toReady = tickets.filter(t => t.status === 'new' || t.status === 'cooking');
                                toReady.forEach(t => updateTicketStatus(t.id, 'ready'));
                            }}
                            className="bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
                        >
                            <Zap className="h-4 w-4 mr-2" />
                            Ready All ({tickets.filter(t => t.status === 'new' || t.status === 'cooking').length})
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                // Auto-deliver: Deliver all ready tickets
                                const toDeliver = tickets.filter(t => t.status === 'ready');
                                toDeliver.forEach(t => deliverTicket(t.id));
                            }}
                            className="bg-emerald/10 border-emerald/30 text-emerald hover:bg-emerald/20"
                        >
                            <ChefHat className="h-4 w-4 mr-2" />
                            Auto-Deliver ({tickets.filter(t => t.status === 'ready').length})
                        </Button>
                        <div className="flex items-center gap-2 mr-2">
                            {systemRunning ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={stopSystem}
                                    className="bg-ruby/10 border-ruby/30 text-ruby hover:bg-ruby/20"
                                >
                                    <Square className="h-4 w-4 mr-2 fill-current" />
                                    Stop Service
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={startSystem}
                                    className="bg-emerald/10 border-emerald/30 text-emerald hover:bg-emerald/20"
                                >
                                    <Play className="h-4 w-4 mr-2 fill-current" />
                                    Run Service
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                    if (confirm("Reset all restaurant data? This cannot be undone.")) {
                                        await resetSystem();
                                    }
                                }}
                                className="text-muted-foreground hover:text-white"
                                title="Reset Data"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
                            <span className="text-sm text-muted-foreground">Live Service</span>
                        </div>
                    </div>
                </header>

                {/* Metrics Row */}
                <div className="grid grid-cols-4 gap-4 mb-6 stagger-children">
                    {metrics.map((metric, i) => {
                        const trend = getTrend(metric.value, metric.previous);
                        const Icon = metric.icon;

                        return (
                            <div key={metric.label} className="metric-card">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2 rounded-lg bg-${metric.color}/10`}>
                                        <Icon className={`h-5 w-5 text-${metric.color}`} />
                                    </div>
                                    {metric.isLive && (
                                        <Badge variant="vip" className="text-[10px]">
                                            <Zap className="h-3 w-3 mr-1" />LIVE
                                        </Badge>
                                    )}
                                </div>
                                <p className="metric-label">{metric.label}</p>
                                <p className={`metric-value ${metric.isLive && pulseRevenue ? 'text-gold animate-pulse' : ''}`}>
                                    {formatValue(metric.value, metric.format)}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                    <div className={`metric-trend flex items-center gap-1 ${trend.positive ? 'positive' : 'negative'}`}>
                                        {trend.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                        {trend.value}%
                                    </div>
                                    <Sparkline
                                        data={metric.data}
                                        color={metric.color as "gold" | "emerald" | "ruby" | "sapphire"}
                                        width={60}
                                        height={20}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Floor Plan - Takes 2 columns */}
                    <Card className="col-span-2 glass-card-elevated">
                        <CardHeader className="border-b border-white/5">
                            <CardTitle className="flex items-center gap-2">
                                <ChefHat className="h-5 w-5 text-gold" />
                                Floor Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Suspense fallback={<div className="h-[400px] flex items-center justify-center text-muted-foreground">Loading floor...</div>}>
                                <FloorPlanView />
                            </Suspense>
                        </CardContent>
                    </Card>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* AI Insights */}
                        <Card className="glass-card-elevated">
                            <CardHeader className="border-b border-white/5">
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-gold" />
                                    Live AI Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                {insights.length === 0 ? (
                                    <div className="text-center py-4 text-muted-foreground text-sm">
                                        Analysing floor data...
                                    </div>
                                ) : (
                                    insights.map((insight, i) => (
                                        <div
                                            key={i}
                                            className={`p-3 rounded-lg border animate-fade-in ${insight.type === 'warning' ? 'bg-ruby/10 border-ruby/30' :
                                                insight.type === 'opportunity' ? 'bg-gold/10 border-gold/30' :
                                                    insight.type === 'prediction' ? 'bg-sapphire/10 border-sapphire/30' :
                                                        'bg-emerald/10 border-emerald/30'
                                                }`}
                                        >
                                            <p className="text-sm font-medium text-white mb-1">{insight.message}</p>
                                            {insight.action && (
                                                <p className="text-xs text-muted-foreground">→ {insight.action}</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Kitchen Status */}
                        <Card className="glass-card-elevated">
                            <CardHeader className="border-b border-white/5">
                                <CardTitle className="flex items-center gap-2">
                                    <Utensils className="h-5 w-5 text-gold" />
                                    Kitchen Queue
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                {kitchenQueue.map((station, i) => (
                                    <div
                                        key={station.station}
                                        className="flex items-center justify-between p-3 glass-card animate-fade-in"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${station.status === 'busy' ? 'bg-gold animate-pulse' : 'bg-emerald'
                                                }`} />
                                            <span className="font-medium text-white">{station.station}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-muted-foreground">{station.tickets} tickets</span>
                                            {station.status === 'busy' && <Badge variant="vip" className="text-[10px]">BUSY</Badge>}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

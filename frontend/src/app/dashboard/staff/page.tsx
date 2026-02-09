"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
    Users,
    Clock,
    DollarSign,
    TrendingUp,
    Phone,
    Calendar,
    Star,
    Award
} from "lucide-react";

// Mock staff data
const STAFF = [
    {
        id: "s1",
        name: "Maria Garcia",
        role: "Head Server",
        status: "on-shift",
        clockedIn: "4:30 PM",
        section: "Tables 1-5",
        salesTonight: 2450,
        tips: 485,
        rating: 4.9,
        shifts: 156
    },
    {
        id: "s2",
        name: "James Wilson",
        role: "Server",
        status: "on-shift",
        clockedIn: "5:00 PM",
        section: "Tables 6-10",
        salesTonight: 1890,
        tips: 378,
        rating: 4.7,
        shifts: 89
    },
    {
        id: "s3",
        name: "Emily Chen",
        role: "Server",
        status: "on-shift",
        clockedIn: "5:00 PM",
        section: "Bar Area",
        salesTonight: 1650,
        tips: 330,
        rating: 4.8,
        shifts: 112
    },
    {
        id: "s4",
        name: "Michael Brown",
        role: "Bartender",
        status: "on-shift",
        clockedIn: "4:00 PM",
        section: "Main Bar",
        salesTonight: 3200,
        tips: 640,
        rating: 4.9,
        shifts: 203
    },
    {
        id: "s5",
        name: "Sarah Johnson",
        role: "Host",
        status: "on-shift",
        clockedIn: "5:30 PM",
        section: "Front Desk",
        salesTonight: 0,
        tips: 0,
        rating: 4.6,
        shifts: 78
    },
    {
        id: "s6",
        name: "David Martinez",
        role: "Server",
        status: "off-shift",
        section: "",
        salesTonight: 0,
        tips: 0,
        rating: 4.5,
        shifts: 45
    },
    {
        id: "s7",
        name: "Chef Marco",
        role: "Executive Chef",
        status: "on-shift",
        clockedIn: "2:00 PM",
        section: "Kitchen",
        salesTonight: 0,
        tips: 0,
        rating: 5.0,
        shifts: 312
    },
    {
        id: "s8",
        name: "Lisa Park",
        role: "Sous Chef",
        status: "on-shift",
        clockedIn: "3:00 PM",
        section: "Kitchen",
        salesTonight: 0,
        tips: 0,
        rating: 4.8,
        shifts: 198
    }
];

const statusStyles: Record<string, string> = {
    "on-shift": "bg-emerald/20 text-emerald border-emerald/30",
    "off-shift": "bg-charcoal text-muted-foreground border-white/10",
    "break": "bg-gold/20 text-gold border-gold/30"
};

export default function StaffPage() {
    const onShift = STAFF.filter(s => s.status === 'on-shift');
    const totalSales = onShift.reduce((sum, s) => sum + s.salesTonight, 0);
    const totalTips = onShift.reduce((sum, s) => sum + s.tips, 0);

    return (
        <div className="flex min-h-screen bg-void">
            <Sidebar />

            <main className="flex-1 ml-20 p-8">
                {/* Header */}
                <header className="mb-8 flex items-center justify-between animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Staff</h1>
                        <p className="text-muted-foreground">Team management and performance</p>
                    </div>
                </header>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mb-6 stagger-children">
                    <div className="metric-card">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-emerald/10">
                                <Users className="h-5 w-5 text-emerald" />
                            </div>
                        </div>
                        <p className="metric-label">On Shift</p>
                        <p className="metric-value">{onShift.length}</p>
                    </div>
                    <div className="metric-card">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-gold/10">
                                <DollarSign className="h-5 w-5 text-gold" />
                            </div>
                        </div>
                        <p className="metric-label">Tonight's Sales</p>
                        <p className="metric-value">${totalSales.toLocaleString()}</p>
                    </div>
                    <div className="metric-card">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-sapphire/10">
                                <TrendingUp className="h-5 w-5 text-sapphire" />
                            </div>
                        </div>
                        <p className="metric-label">Total Tips</p>
                        <p className="metric-value">${totalTips.toLocaleString()}</p>
                    </div>
                    <div className="metric-card">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-gold/10">
                                <Star className="h-5 w-5 text-gold" />
                            </div>
                        </div>
                        <p className="metric-label">Avg Rating</p>
                        <p className="metric-value">4.8</p>
                    </div>
                </div>

                {/* Staff Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {STAFF.map((staff, i) => (
                        <Card
                            key={staff.id}
                            className="glass-card hover:border-gold/20 cursor-pointer animate-fade-in"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <Avatar alt={staff.name} size="lg" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-white">{staff.name}</h3>
                                                <Badge className={statusStyles[staff.status]}>
                                                    {staff.status === 'on-shift' ? 'On Shift' : 'Off'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-1 text-gold">
                                                <Star className="h-4 w-4 fill-gold" />
                                                <span className="font-mono text-sm">{staff.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">{staff.role}</p>

                                        {staff.status === 'on-shift' && (
                                            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-white/5">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Clocked In</p>
                                                    <p className="text-sm font-mono text-white">{staff.clockedIn}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Section</p>
                                                    <p className="text-sm text-white">{staff.section}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Sales</p>
                                                    <p className="text-sm font-mono text-gold">${staff.salesTonight}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}

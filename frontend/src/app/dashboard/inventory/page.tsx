"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Badge } from "@/components/ui/badge";
import {
    Package,
    AlertTriangle,
    TrendingDown,
    TrendingUp,
    Search,
    Filter,
    Wine,
    Beef,
    Fish,
    Salad
} from "lucide-react";

// Mock inventory data
const INVENTORY_CATEGORIES = [
    {
        name: "Proteins",
        icon: Beef,
        items: [
            { id: "p1", name: "Ribeye 12oz", current: 8, par: 20, unit: "portions", status: "critical", cost: 24 },
            { id: "p2", name: "Sea Bass", current: 12, par: 15, unit: "portions", status: "low", cost: 18 },
            { id: "p3", name: "Chicken Breast", current: 25, par: 20, unit: "portions", status: "ok", cost: 8 },
            { id: "p4", name: "Lamb Rack", current: 6, par: 10, unit: "portions", status: "low", cost: 32 },
        ]
    },
    {
        name: "Seafood",
        icon: Fish,
        items: [
            { id: "s1", name: "Lobster Tail", current: 4, par: 12, unit: "pieces", status: "critical", cost: 45 },
            { id: "s2", name: "Jumbo Shrimp", current: 30, par: 40, unit: "pieces", status: "ok", cost: 3 },
            { id: "s3", name: "Oysters", current: 48, par: 60, unit: "pieces", status: "ok", cost: 4 },
        ]
    },
    {
        name: "Produce",
        icon: Salad,
        items: [
            { id: "v1", name: "Arugula", current: 5, par: 8, unit: "lbs", status: "low", cost: 6 },
            { id: "v2", name: "Asparagus", current: 12, par: 10, unit: "bunches", status: "ok", cost: 5 },
            { id: "v3", name: "Truffle (Black)", current: 2, par: 3, unit: "oz", status: "low", cost: 85 },
        ]
    },
    {
        name: "Wine & Spirits",
        icon: Wine,
        items: [
            { id: "w1", name: "Caymus Cabernet 2018", current: 3, par: 6, unit: "bottles", status: "low", cost: 120 },
            { id: "w2", name: "Dom Perignon", current: 6, par: 4, unit: "bottles", status: "ok", cost: 250 },
            { id: "w3", name: "Grey Goose", current: 4, par: 6, unit: "bottles", status: "low", cost: 35 },
        ]
    }
];

const statusStyles: Record<string, string> = {
    ok: "bg-emerald/20 text-emerald border-emerald/30",
    low: "bg-gold/20 text-gold border-gold/30",
    critical: "bg-ruby/20 text-ruby border-ruby/30"
};

const statusIcons: Record<string, any> = {
    ok: TrendingUp,
    low: TrendingDown,
    critical: AlertTriangle
};

export default function InventoryPage() {
    const allItems = INVENTORY_CATEGORIES.flatMap(c => c.items);
    const criticalCount = allItems.filter(i => i.status === 'critical').length;
    const lowCount = allItems.filter(i => i.status === 'low').length;
    const totalValue = allItems.reduce((sum, i) => sum + (i.current * i.cost), 0);

    return (
        <div className="flex min-h-screen bg-void">
            <Sidebar />

            <main className="flex-1 ml-20 p-8">
                {/* Header */}
                <header className="mb-8 flex items-center justify-between animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Inventory</h1>
                        <p className="text-muted-foreground">Stock levels and ordering</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                className="pl-10 pr-4 py-2 rounded-lg bg-charcoal border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 w-64"
                            />
                        </div>
                        <button className="p-2 rounded-lg bg-charcoal border border-white/10 hover:border-white/20 transition-colors">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>
                </header>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mb-6 stagger-children">
                    <div className="metric-card">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-ruby/10">
                                <AlertTriangle className="h-5 w-5 text-ruby" />
                            </div>
                        </div>
                        <p className="metric-label">Critical</p>
                        <p className="metric-value text-ruby">{criticalCount}</p>
                    </div>
                    <div className="metric-card">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-gold/10">
                                <TrendingDown className="h-5 w-5 text-gold" />
                            </div>
                        </div>
                        <p className="metric-label">Low Stock</p>
                        <p className="metric-value text-gold">{lowCount}</p>
                    </div>
                    <div className="metric-card">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-emerald/10">
                                <Package className="h-5 w-5 text-emerald" />
                            </div>
                        </div>
                        <p className="metric-label">Total Items</p>
                        <p className="metric-value">{allItems.length}</p>
                    </div>
                    <div className="metric-card">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-sapphire/10">
                                <Package className="h-5 w-5 text-sapphire" />
                            </div>
                        </div>
                        <p className="metric-label">Stock Value</p>
                        <p className="metric-value">${totalValue.toLocaleString()}</p>
                    </div>
                </div>

                {/* Inventory Categories */}
                <div className="space-y-6">
                    {INVENTORY_CATEGORIES.map((category, catIdx) => (
                        <Card key={category.name} className="glass-card-elevated animate-fade-in" style={{ animationDelay: `${catIdx * 0.1}s` }}>
                            <CardHeader className="border-b border-white/5">
                                <CardTitle className="flex items-center gap-2">
                                    <category.icon className="h-5 w-5 text-gold" />
                                    {category.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left p-4 text-xs text-muted-foreground uppercase tracking-wider">Item</th>
                                            <th className="text-center p-4 text-xs text-muted-foreground uppercase tracking-wider">Current</th>
                                            <th className="text-center p-4 text-xs text-muted-foreground uppercase tracking-wider">Par Level</th>
                                            <th className="text-center p-4 text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                                            <th className="text-right p-4 text-xs text-muted-foreground uppercase tracking-wider">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {category.items.map((item) => {
                                            const StatusIcon = statusIcons[item.status];
                                            const percentage = (item.current / item.par) * 100;

                                            return (
                                                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="p-4">
                                                        <span className="font-medium text-white">{item.name}</span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className={`font-mono font-bold ${item.status === 'critical' ? 'text-ruby' : item.status === 'low' ? 'text-gold' : 'text-white'}`}>
                                                                {item.current}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">{item.unit}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="font-mono text-muted-foreground">{item.par}</span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <Badge className={statusStyles[item.status]}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {Math.round(percentage)}%
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <span className="font-mono text-gold">${(item.current * item.cost).toLocaleString()}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}

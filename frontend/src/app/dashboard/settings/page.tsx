"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Settings,
    Building2,
    Bell,
    Users,
    Link2,
    Shield,
    Palette,
    Globe,
    CreditCard,
    Printer,
    ChevronRight
} from "lucide-react";

const SETTINGS_SECTIONS = [
    {
        title: "Restaurant",
        icon: Building2,
        items: [
            { name: "Restaurant Profile", description: "Name, address, contact info", href: "#" },
            { name: "Operating Hours", description: "Manage service hours and holidays", href: "#" },
            { name: "Table Configuration", description: "Floor plan and seating capacity", href: "#" },
        ]
    },
    {
        title: "Notifications",
        icon: Bell,
        items: [
            { name: "Alert Preferences", description: "Configure alerts and thresholds", href: "#" },
            { name: "Email Notifications", description: "Daily reports and summaries", href: "#" },
            { name: "SMS Alerts", description: "Critical alerts via text", href: "#" },
        ]
    },
    {
        title: "Team",
        icon: Users,
        items: [
            { name: "Staff Accounts", description: "Manage team access and roles", href: "#" },
            { name: "Permissions", description: "Role-based access control", href: "#" },
            { name: "Training Mode", description: "Enable practice mode for new hires", href: "#" },
        ]
    },
    {
        title: "Integrations",
        icon: Link2,
        items: [
            { name: "POS System", description: "Toast, Square, Lightspeed", href: "#", connected: true },
            { name: "Reservations", description: "OpenTable, Resy, Tock", href: "#", connected: true },
            { name: "Accounting", description: "QuickBooks, Xero", href: "#", connected: false },
            { name: "Marketing", description: "Mailchimp, Klaviyo", href: "#", connected: false },
        ]
    },
    {
        title: "Hardware",
        icon: Printer,
        items: [
            { name: "Printers", description: "Kitchen and receipt printers", href: "#" },
            { name: "Tablets", description: "Server and KDS devices", href: "#" },
            { name: "Payment Terminals", description: "Card readers and NFC", href: "#" },
        ]
    },
    {
        title: "Billing",
        icon: CreditCard,
        items: [
            { name: "Subscription", description: "Current plan: Enterprise", href: "#" },
            { name: "Payment Method", description: "Manage billing info", href: "#" },
            { name: "Usage & Invoices", description: "View billing history", href: "#" },
        ]
    },
];

export default function SettingsPage() {
    return (
        <div className="flex min-h-screen bg-void">
            <Sidebar />

            <main className="flex-1 ml-20 p-8">
                {/* Header */}
                <header className="mb-8 flex items-center justify-between animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
                        <p className="text-muted-foreground">Configure your restaurant system</p>
                    </div>
                </header>

                {/* Settings Grid */}
                <div className="grid grid-cols-2 gap-6">
                    {SETTINGS_SECTIONS.map((section, secIdx) => (
                        <Card key={section.title} className="glass-card-elevated animate-fade-in" style={{ animationDelay: `${secIdx * 0.05}s` }}>
                            <CardHeader className="border-b border-white/5">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <section.icon className="h-5 w-5 text-gold" />
                                    {section.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-white/5">
                                    {section.items.map((item) => (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-white">{item.name}</p>
                                                    {'connected' in item && (
                                                        <Badge variant={item.connected ? "returning" : "station"}>
                                                            {item.connected ? "Connected" : "Not Connected"}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-gold transition-colors" />
                                        </a>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Danger Zone */}
                <Card className="mt-6 glass-card border-ruby/20">
                    <CardHeader className="border-b border-ruby/10">
                        <CardTitle className="flex items-center gap-2 text-ruby">
                            <Shield className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-white">Reset Demo Data</p>
                                <p className="text-sm text-muted-foreground">Clear all demo data and start fresh</p>
                            </div>
                            <Button className="bg-ruby/20 hover:bg-ruby/30 text-ruby border border-ruby/30">
                                Reset Data
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

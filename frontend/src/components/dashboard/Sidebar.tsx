"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Grid3X3,
    Users,
    Package,
    Settings,
    ChefHat,
    Tablet,
    CalendarDays,
    ClipboardList,
    Flame
} from "lucide-react";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/reservations", icon: CalendarDays, label: "Reservations" },
    { href: "/dashboard/waitlist", icon: ClipboardList, label: "Waitlist" },
    { href: "/dashboard/floor", icon: Grid3X3, label: "Floor Plan" },
    { href: "/tablet", icon: Tablet, label: "Server Tablet" },
    { href: "/kds", icon: Flame, label: "Kitchen Display" },
    { href: "/dashboard/staff", icon: Users, label: "Staff" },
    { href: "/dashboard/inventory", icon: Package, label: "Inventory" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <nav className="nav-sidebar glass-panel border-r border-white/5 backdrop-blur-3xl bg-transparent">
            {/* Logo */}
            <div className="mb-8">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <ChefHat className="h-5 w-5 text-gold" />
                </div>
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col gap-2 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "nav-item group relative",
                                isActive && "active"
                            )}
                            title={item.label}
                        >
                            <Icon className="h-5 w-5" />

                            {/* Tooltip */}
                            <span className="absolute left-full ml-3 px-2 py-1 rounded bg-charcoal text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Status Indicator */}
            <div className="mt-auto pt-4">
                <div className="w-12 h-12 rounded-xl bg-emerald/10 flex items-center justify-center relative">
                    <div className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap">
                        Live
                    </span>
                </div>
            </div>
        </nav>
    );
}

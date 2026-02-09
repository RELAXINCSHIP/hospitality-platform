"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Star, AlertTriangle, Wine, Clock, Heart } from "lucide-react";

interface GuestProfile {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    isVip?: boolean;
    isNew?: boolean;
    visitCount?: number;
    lastVisit?: string;
    preferences?: string[];
    allergies?: string[];
    favoriteWine?: string;
    averageSpend?: number;
    notes?: string;
}

interface GuestProfileCardProps {
    guest: GuestProfile | null;
    compact?: boolean;
}

export function GuestProfileCard({ guest, compact = false }: GuestProfileCardProps) {
    if (!guest) {
        return (
            <div className="glass-card p-4 text-center">
                <p className="text-muted-foreground text-sm">No guest profile linked</p>
                <p className="text-xs text-muted-foreground mt-1">Tap to search or create</p>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="glass-card p-3 flex items-center gap-3">
                <Avatar alt={guest.name} size="sm" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">{guest.name}</span>
                        {guest.isVip && <Badge variant="vip">VIP</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                        {guest.visitCount || 0} visits • ${guest.averageSpend?.toFixed(0) || 0} avg
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card-elevated p-5 space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Avatar alt={guest.name} size="lg" />
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{guest.name}</h3>
                        {guest.isVip && <Badge variant="vip"><Star className="h-3 w-3 mr-1" />VIP</Badge>}
                        {guest.isNew && <Badge variant="new">New</Badge>}
                        {!guest.isNew && guest.visitCount && guest.visitCount > 1 && (
                            <Badge variant="returning">Returning</Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {guest.visitCount || 0} visits • Last: {guest.lastVisit || "First time"}
                    </p>
                </div>
            </div>

            {/* Allergies Warning */}
            {guest.allergies && guest.allergies.length > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-ruby/10 border border-ruby/20">
                    <AlertTriangle className="h-5 w-5 text-ruby shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-ruby">Allergies</p>
                        <p className="text-sm text-ruby/80">{guest.allergies.join(", ")}</p>
                    </div>
                </div>
            )}

            {/* Preferences Grid */}
            <div className="grid grid-cols-2 gap-3">
                {guest.favoriteWine && (
                    <div className="flex items-center gap-2 text-sm">
                        <Wine className="h-4 w-4 text-gold" />
                        <span className="text-muted-foreground">Prefers:</span>
                        <span className="text-white">{guest.favoriteWine}</span>
                    </div>
                )}
                {guest.averageSpend && (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Avg Check:</span>
                        <span className="text-gold font-mono font-semibold">${guest.averageSpend}</span>
                    </div>
                )}
            </div>

            {/* Preferences Tags */}
            {guest.preferences && guest.preferences.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {guest.preferences.map((pref, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                            <Heart className="h-3 w-3 mr-1 text-gold" />
                            {pref}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Notes */}
            {guest.notes && (
                <div className="p-3 rounded-lg bg-charcoal border border-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Staff Notes</p>
                    <p className="text-sm text-white">{guest.notes}</p>
                </div>
            )}
        </div>
    );
}

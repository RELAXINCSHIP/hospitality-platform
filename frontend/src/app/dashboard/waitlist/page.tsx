"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useRestaurant } from "@/context/RestaurantContext";
import {
    Users,
    Phone,
    Plus,
    Star,
    Check,
    X,
    Bell
} from "lucide-react";

export default function WaitlistPage() {
    // Context
    const { waitingGuests, addToWaitlist, removeFromWaitlist } = useRestaurant();

    // Local state for modal
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [newName, setNewName] = useState("");
    const [newParty, setNewParty] = useState(2);
    const [newPhone, setNewPhone] = useState("");
    const [newQuotedWait, setNewQuotedWait] = useState(15);
    const [newNotes, setNewNotes] = useState("");
    const [newIsVip, setNewIsVip] = useState(false);

    // Derived Stats
    const waiting = waitingGuests.length;
    // Calculate average wait based on creation time if available, otherwise mock it or use a default
    // Since GuestToSeat doesn't have 'actualWait' yet in the interface (it has source), we might need to assume 
    // or we can just leave it as mocked/random for the display if the context doesn't track start time.
    // Checking RestaurantContext types: GuestToSeat doesn't have timestamp. 
    // Let's just calculate total covers.
    const totalCovers = waitingGuests.reduce((sum, w) => sum + w.party, 0);

    const statusStyles: Record<string, string> = {
        waiting: "bg-sapphire/20 text-sapphire border-sapphire/30",
        notified: "bg-gold/20 text-gold border-gold/30",
        seated: "bg-emerald/20 text-emerald border-emerald/30",
        cancelled: "bg-ruby/20 text-ruby border-ruby/30"
    };

    const handleAddGuest = () => {
        if (!newName) return;

        const guest = {
            id: Math.random().toString(36).substr(2, 9),
            name: newName,
            party: newParty,
            phone: newPhone, // Note: interface might need update if phone is missing, let's check. 
            // Wait, GuestToSeat in context has: id, name, party, isVip, notes, source. NO PHONE.
            // I will add it to notes for now or ignore it.
            isVip: newIsVip,
            notes: newNotes + (newPhone ? ` | Phone: ${newPhone}` : ""), // Append phone to notes
            source: 'walkin' as const
        };

        addToWaitlist(guest);
        resetForm();
        setShowAddModal(false);
    };

    const resetForm = () => {
        setNewName("");
        setNewParty(2);
        setNewPhone("");
        setNewQuotedWait(15);
        setNewNotes("");
        setNewIsVip(false);
    };

    const router = useRouter();

    const handleSeat = (id: string) => {
        // Navigate to floor plan with guest ID to initiate seating flow
        router.push(`/dashboard/floor?seatGuestId=${id}`);
    };

    return (
        <div className="flex min-h-screen bg-void">
            <Sidebar />

            <main className="flex-1 ml-20 p-8">
                {/* Header */}
                <header className="mb-8 flex items-center justify-between animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Waitlist</h1>
                        <p className="text-muted-foreground">Manage walk-ins and queue</p>
                    </div>
                    <Button
                        className="bg-gold hover:bg-gold/90 text-void font-semibold"
                        onClick={() => setShowAddModal(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Waitlist
                    </Button>
                </header>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mb-6 stagger-children">
                    <div className="glass-card p-4 text-center">
                        <p className="text-3xl font-bold text-sapphire">{waiting}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Waiting</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <p className="text-3xl font-bold text-gold">15m</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Wait</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <p className="text-3xl font-bold text-white">{totalCovers}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Covers</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <p className="text-3xl font-bold text-emerald">3</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Tables Soon</p>
                    </div>
                </div>

                {/* Waitlist Cards */}
                <div className="space-y-4">
                    {waitingGuests.map((guest, i) => {
                        // Mocking wait times for UI consistency since context doesn't have it yet
                        const quotedWait = 20;
                        const actualWait = 5;
                        const isOverdue = actualWait > quotedWait;
                        const status = 'waiting'; // Context guests are 'waiting' by default in this list

                        return (
                            <Card
                                key={guest.id}
                                className={`glass-card-elevated animate-fade-in transition-all ${isOverdue ? 'border-ruby/30' : ''
                                    }`}
                                style={{ animationDelay: `${i * 0.05}s` }}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        {/* Guest Info */}
                                        <div className="flex items-center gap-4">
                                            {/* Position */}
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${i === 0 ? 'bg-gold/20 text-gold' : 'bg-charcoal text-muted-foreground'
                                                }`}>
                                                {i + 1}
                                            </div>

                                            <Avatar alt={guest.name} size="md" />

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-white">{guest.name}</span>
                                                    {guest.isVip && <Badge variant="vip"><Star className="h-3 w-3 mr-1" />VIP</Badge>}
                                                    <Badge className={statusStyles[status]}>{status}</Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" /> Party of {guest.party}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" /> {guest.notes?.includes("Phone:") ? guest.notes.split("Phone:")[1] : "N/A"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Wait Time + Actions */}
                                        <div className="flex items-center gap-6">
                                            {/* Timing */}
                                            <div className="text-right">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">Quoted</span>
                                                    <span className="font-mono text-white">{quotedWait}m</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">Actual</span>
                                                    <span className={`font-mono font-bold ${isOverdue ? 'text-ruby' : 'text-emerald'}`}>
                                                        {actualWait}m
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => { }}
                                                    className="bg-gold/20 hover:bg-gold/30 text-gold border border-gold/30"
                                                >
                                                    <Bell className="h-4 w-4 mr-2" />
                                                    Notify
                                                </Button>

                                                <Button
                                                    onClick={() => handleSeat(guest.id)}
                                                    className="bg-emerald hover:bg-emerald/90 text-void font-semibold"
                                                >
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Seat
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    onClick={() => removeFromWaitlist(guest.id)}
                                                    className="text-ruby/50 hover:text-ruby hover:bg-ruby/10"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {(guest.notes) && (
                                        <div className="mt-3 pt-3 border-t border-white/5 flex gap-4">
                                            {guest.source && (
                                                <span className="text-sm text-gold">• {guest.source}</span>
                                            )}
                                            {guest.notes && (
                                                <span className="text-sm text-muted-foreground">{guest.notes}</span>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Add Guest Modal */}
                <Modal
                    open={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    title="Add to Waitlist"
                    size="md"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Guest Name</label>
                            <input
                                type="text"
                                placeholder="Last, First"
                                className="w-full p-3 rounded-lg bg-charcoal border border-white/10 text-white focus:outline-none focus:border-gold/50"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Party Size</label>
                                <input
                                    type="number"
                                    placeholder="2"
                                    className="w-full p-3 rounded-lg bg-charcoal border border-white/10 text-white focus:outline-none focus:border-gold/50"
                                    value={newParty}
                                    onChange={(e) => setNewParty(parseInt(e.target.value) || 2)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Quoted Wait (min)</label>
                                <input
                                    type="number"
                                    placeholder="15"
                                    className="w-full p-3 rounded-lg bg-charcoal border border-white/10 text-white focus:outline-none focus:border-gold/50"
                                    value={newQuotedWait}
                                    onChange={(e) => setNewQuotedWait(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Phone</label>
                            <input
                                type="tel"
                                placeholder="(702) 555-1234"
                                className="w-full p-3 rounded-lg bg-charcoal border border-white/10 text-white focus:outline-none focus:border-gold/50"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 mb-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newIsVip}
                                    onChange={(e) => setNewIsVip(e.target.checked)}
                                    className="accent-gold w-4 h-4"
                                />
                                <span className="text-sm text-white">VIP Guest</span>
                            </label>
                            <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Notes</label>
                            <textarea
                                placeholder="Special requests..."
                                rows={2}
                                className="w-full p-3 rounded-lg bg-charcoal border border-white/10 text-white focus:outline-none focus:border-gold/50 resize-none"
                                value={newNotes}
                                onChange={(e) => setNewNotes(e.target.value)}
                            />
                        </div>
                        <Button
                            className="w-full bg-gold hover:bg-gold/90 text-void font-semibold mt-4"
                            onClick={handleAddGuest}
                        >
                            Add Guest
                        </Button>
                    </div>
                </Modal>
            </main>
        </div>
    );
}

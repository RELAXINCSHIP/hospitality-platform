'use client';

import { useState } from 'react';
import { useRestaurant, TableData, GuestToSeat } from '@/context/RestaurantContext';
import {
    Users,
    Clock,
    Calendar,
    Search,
    Plus,
    MoreHorizontal,
    Phone,
    MapPin,
    ChevronRight,
    Utensils
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function HostPage() {
    const { tables, waitingGuests, seatTable, addToWaitlist, removeFromWaitlist, clearTable } = useRestaurant();
    const [selectedGuest, setSelectedGuest] = useState<GuestToSeat | null>(null);
    const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);

    // Walk-in / Table Details State
    const [selectedTableForAction, setSelectedTableForAction] = useState<TableData | null>(null);
    const [walkInGuest, setWalkInGuest] = useState<Partial<GuestToSeat>>({
        name: '',
        party: 2,
        isVip: false,
        notes: '',
        source: 'walkin'
    });

    const [newGuest, setNewGuest] = useState<Partial<GuestToSeat>>({
        name: '',
        party: 2,
        isVip: false,
        notes: '',
        source: 'walkin'
    });

    // Stats
    const totalGuests = tables.reduce((sum, t) => sum + (t.guestCount || 0), 0);
    const openTables = tables.filter(t => t.status === 'available').length;
    const waitTime = waitingGuests.length * 5; // Mock logic

    const handleAddGuest = () => {
        if (!newGuest.name) return;
        addToWaitlist({
            id: `w-${Date.now()}`,
            name: newGuest.name,
            party: newGuest.party || 2,
            isVip: newGuest.isVip || false,
            notes: newGuest.notes,
            source: 'walkin'
        } as GuestToSeat);
        setIsAddGuestOpen(false);
        setNewGuest({ name: '', party: 2, isVip: false, notes: '', source: 'walkin' });
    };

    const handleSeatGuest = (tableId: string) => {
        if (!selectedGuest) return;
        seatTable(tableId, selectedGuest);
        setSelectedGuest(null);
    };

    const handleSeatWalkIn = () => {
        if (!selectedTableForAction) return;

        const guest: GuestToSeat = {
            id: `g-${Date.now()}`,
            name: walkInGuest.name || 'Walk-in',
            party: walkInGuest.party || selectedTableForAction.capacity,
            isVip: walkInGuest.isVip || false,
            notes: walkInGuest.notes,
            source: 'walkin'
        };

        seatTable(selectedTableForAction.id, guest);
        setSelectedTableForAction(null);
        setWalkInGuest({ name: '', party: 2, isVip: false, notes: '', source: 'walkin' });
    };

    const handleClearTable = () => {
        if (!selectedTableForAction) return;
        if (confirm(`Clear Table ${selectedTableForAction.number}?`)) {
            clearTable(selectedTableForAction.id);
            setSelectedTableForAction(null);
        }
    };

    return (
        <div className="flex h-screen bg-void text-white overflow-hidden">
            {/* Sidebar: Waitlist & Reservations */}
            <aside className="w-96 border-r border-white/5 bg-charcoal/50 flex flex-col">
                <div className="p-6 border-b border-white/5">
                    <h1 className="text-2xl font-bold text-white mb-4">Host Stand</h1>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="p-3 rounded-xl bg-white/5 text-center">
                            <div className="text-xs text-muted-foreground uppercase">Wait</div>
                            <div className={`text-xl font-bold ${waitTime > 30 ? 'text-ruby' : 'text-emerald'}`}>
                                {waitTime}m
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 text-center">
                            <div className="text-xs text-muted-foreground uppercase">Guests</div>
                            <div className="text-xl font-bold text-white">{totalGuests}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 text-center">
                            <div className="text-xs text-muted-foreground uppercase">Open</div>
                            <div className="text-xl font-bold text-gold">{openTables}</div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search guests..."
                            className="pl-9 bg-void border-white/10 text-white placeholder:text-muted-foreground/50"
                        />
                    </div>
                </div>

                {/* Waitlist */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 flex items-center justify-between sticky top-0 bg-charcoal/95 backdrop-blur z-10">
                        <h2 className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">Waitlist ({waitingGuests.length})</h2>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gold hover:text-gold hover:bg-gold/10"
                            onClick={() => setIsAddGuestOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="px-4 pb-4 space-y-2">
                        {waitingGuests.map(guest => (
                            <div
                                key={guest.id}
                                onClick={() => setSelectedGuest(guest === selectedGuest ? null : guest)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedGuest?.id === guest.id
                                    ? 'bg-gold/10 border-gold/50 shadow-[0_0_15px_-3px_rgba(255,215,0,0.3)]'
                                    : 'bg-void border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-white">{guest.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-muted-foreground">
                                            {guest.party} ppl
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> 5m ago
                                    </span>
                                    {guest.isVip && <span className="text-gold font-bold">VIP</span>}
                                </div>
                                {guest.notes && (
                                    <p className="mt-2 text-xs text-white/70 italic">"{guest.notes}"</p>
                                )}

                                {selectedGuest?.id === guest.id && (
                                    <div className="mt-4 flex gap-2 animate-fade-in">
                                        <Button className="flex-1 h-8 text-xs bg-gold text-void hover:bg-gold/90">
                                            Text Guest
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="h-8 w-8 p-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFromWaitlist(guest.id);
                                            }}
                                        >
                                            &times;
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main: Floor Map */}
            <main className="flex-1 p-8 bg-void relative overflow-hidden overflow-y-auto">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                <header className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-1">Floor Plan</h2>
                        <p className="text-muted-foreground">Main Dining Room</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" /> Available
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-3 h-3 rounded-full bg-charcoal border border-white/20" /> Occupied
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-3 h-3 rounded-full bg-ruby-500" /> Alert
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-4 gap-6 relative z-10 max-w-5xl mx-auto">
                    {tables.map(table => {
                        const isAvailable = table.status === 'available';
                        const isCompatible = selectedGuest ? table.capacity >= selectedGuest.party : true;

                        // Visual cues
                        const isSuggested = selectedGuest && isAvailable && isCompatible;
                        const isClickable = true; // ALWAYS clickable now

                        return (
                            <div
                                key={table.id}
                                onClick={() => {
                                    if (selectedGuest) {
                                        // Seat Waitlist Guest Logic
                                        if (!isAvailable) return;
                                        if (!isCompatible) {
                                            if (!confirm(`Table ${table.number} has capacity ${table.capacity}, but party is ${selectedGuest.party}. Seat anyway?`)) {
                                                return;
                                            }
                                        }
                                        handleSeatGuest(table.id);
                                    } else {
                                        // Direct Interaction Logic (Walk-in / Clear)
                                        setSelectedTableForAction(table);
                                        // Pre-fill party size with table capacity
                                        setWalkInGuest(prev => ({ ...prev, party: table.capacity }));
                                    }
                                }}
                                className={`aspect-square rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 relative group ${isAvailable
                                    ? isSuggested
                                        ? 'bg-gold/20 border-2 border-gold cursor-pointer scale-105 shadow-[0_0_30px_-5px_rgba(255,215,0,0.5)] animate-pulse'
                                        : 'bg-emerald/10 border border-emerald/30 hover:bg-emerald/20 cursor-pointer'
                                    : table.status === 'alert'
                                        ? 'bg-ruby/10 border border-ruby/50 animate-pulse-alert cursor-pointer'
                                        : 'bg-charcoal border border-white/5 cursor-pointer hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-2xl font-bold text-white/90">{table.number}</span>
                                    <div className="flex gap-1">
                                        {[...Array(table.capacity)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-2 h-2 rounded-full ${i < (table.guestCount || 0) ? 'bg-white' : 'bg-white/10'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="text-center">
                                    {isAvailable ? (
                                        selectedGuest ? (
                                            isSuggested ? (
                                                <span className="text-gold font-bold uppercase tracking-wider text-sm">Tap to Seat</span>
                                            ) : (
                                                <span className="text-gold/50 font-medium uppercase tracking-wider text-xs">Over Capacity</span>
                                            )
                                        ) : (
                                            <span className="text-emerald font-medium text-sm">Available</span>
                                        )
                                    ) : (
                                        <>
                                            <div className="font-semibold text-white truncate max-w-full">
                                                {table.guestName}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {table.server} • {table.currentCourse}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex justify-between items-end text-xs text-muted-foreground">
                                    <span>{table.capacity} top</span>
                                    {table.isVip && <span className="text-gold font-bold">VIP</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Add Guest Dialog */}
            <Dialog open={isAddGuestOpen} onOpenChange={setIsAddGuestOpen}>
                <DialogContent className="bg-charcoal border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Add to Waitlist</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Guest Name</Label>
                            <Input
                                value={newGuest.name}
                                onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                                className="bg-void border-white/10"
                                placeholder="Last Name, First Name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Party Size</Label>
                                <Input
                                    type="number"
                                    value={newGuest.party}
                                    onChange={(e) => setNewGuest({ ...newGuest, party: parseInt(e.target.value) })}
                                    className="bg-void border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Source</Label>
                                <select
                                    className="w-full h-10 rounded-md border border-white/10 bg-void px-3 py-2 text-sm text-white"
                                    value={newGuest.source}
                                    onChange={(e) => setNewGuest({ ...newGuest, source: e.target.value as any })}
                                >
                                    <option value="walkin">Walk-in</option>
                                    <option value="reservation">Reservation</option>
                                    <option value="call">Call-ahead</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Input
                                value={newGuest.notes}
                                onChange={(e) => setNewGuest({ ...newGuest, notes: e.target.value })}
                                className="bg-void border-white/10"
                                placeholder="Any special requests or details"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            className="bg-gold text-void hover:bg-gold/90"
                            onClick={handleAddGuest}
                        >
                            Add Guest
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Walk-in / Table Details Dialog */}
            <Dialog open={!!selectedTableForAction} onOpenChange={(open) => !open && setSelectedTableForAction(null)}>
                <DialogContent className="bg-charcoal border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Table {selectedTableForAction?.number}</DialogTitle>
                    </DialogHeader>

                    {selectedTableForAction?.status === 'available' ? (
                        <div className="space-y-4 py-4">
                            <p className="text-muted-foreground">Seat a walk-in guest at this table.</p>
                            <div className="space-y-2">
                                <Label>Guest Name</Label>
                                <Input
                                    value={walkInGuest.name}
                                    onChange={(e) => setWalkInGuest({ ...walkInGuest, name: e.target.value })}
                                    className="bg-void border-white/10"
                                    placeholder="Walk-in"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Party Size</Label>
                                <Input
                                    type="number"
                                    value={walkInGuest.party}
                                    onChange={(e) => setWalkInGuest({ ...walkInGuest, party: parseInt(e.target.value) })}
                                    className="bg-void border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Input
                                    value={walkInGuest.notes}
                                    onChange={(e) => setWalkInGuest({ ...walkInGuest, notes: e.target.value })}
                                    className="bg-void border-white/10"
                                    placeholder="Special requests"
                                />
                            </div>
                            <Button
                                className="w-full bg-gold text-void hover:bg-gold/90 mt-4"
                                onClick={handleSeatWalkIn}
                            >
                                Seat Walk-in
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-card p-3">
                                    <p className="text-xs text-muted-foreground uppercase">Guest</p>
                                    <p className="font-bold text-white">{selectedTableForAction?.guestName}</p>
                                </div>
                                <div className="glass-card p-3">
                                    <p className="text-xs text-muted-foreground uppercase">Server</p>
                                    <p className="font-bold text-gold">{selectedTableForAction?.server}</p>
                                </div>
                            </div>

                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={handleClearTable}
                            >
                                Clear Table
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

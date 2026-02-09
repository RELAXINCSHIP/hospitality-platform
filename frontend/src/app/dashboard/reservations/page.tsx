"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Added router
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input"; // Added
import { Label } from "@/components/ui/label"; // Added
import {
    CalendarDays,
    Clock,
    Users,
    Phone,
    Mail,
    Star,
    Plus,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRestaurant, GuestToSeat } from "@/context/RestaurantContext"; // Added context

// Mock reservation data (Moved inside component or kept as initial)
const INITIAL_RESERVATIONS = [
    {
        id: "r1",
        time: "6:00 PM",
        name: "Johnson, Michael",
        party: 4,
        table: 5,
        phone: "(702) 555-1234",
        email: "mjohnson@email.com",
        status: "confirmed",
        isVip: true,
        notes: "Anniversary dinner - requesting corner booth",
        requests: ["Gluten-free menu", "Champagne on ice"]
    },
    {
        id: "r2",
        time: "6:30 PM",
        name: "Williams, Sarah",
        party: 2,
        table: 3,
        phone: "(702) 555-5678",
        email: "",
        status: "confirmed",
        isVip: false,
        notes: "",
        requests: []
    },
    {
        id: "r3",
        time: "7:00 PM",
        name: "Chen, Lisa",
        party: 6,
        table: 8,
        phone: "(702) 555-9012",
        email: "",
        status: "confirmed",
        isVip: true,
        notes: "Business dinner - separate checks",
        requests: ["Private area if possible"]
    },
    {
        id: "r4",
        time: "7:00 PM",
        name: "Rodriguez, Antonio",
        party: 2,
        table: 2,
        phone: "(702) 555-3456",
        email: "",
        status: "pending",
        isVip: false,
        notes: "",
        requests: []
    },
    {
        id: "r5",
        time: "7:30 PM",
        name: "Smith, James",
        party: 4,
        table: 6,
        phone: "(702) 555-7890",
        email: "",
        status: "confirmed",
        isVip: false,
        notes: "",
        requests: []
    },
    {
        id: "r6",
        time: "8:00 PM",
        name: "Davis, Karen",
        party: 8,
        table: 10,
        phone: "(702) 555-2345",
        email: "karen.d@company.com",
        status: "waitlist",
        isVip: true,
        notes: "Large party - CEO birthday",
        requests: []
    },
    {
        id: "r7",
        time: "8:30 PM",
        name: "Brown, Thomas",
        party: 2,
        table: 1,
        phone: "(702) 555-6789",
        email: "",
        status: "confirmed",
        isVip: false,
        notes: "",
        requests: []
    },
    {
        id: "r8",
        time: "9:00 PM",
        name: "Taylor, Emma",
        party: 4,
        table: 7,
        phone: "(702) 555-0123",
        email: "",
        status: "confirmed",
        isVip: false,
        notes: "Late seating - kitchen aware",
        requests: []
    }
];

const statusStyles: Record<string, string> = {
    confirmed: "bg-emerald/20 text-emerald border-emerald/30",
    pending: "bg-gold/20 text-gold border-gold/30",
    waitlist: "bg-sapphire/20 text-sapphire border-sapphire/30",
    cancelled: "bg-ruby/20 text-ruby border-ruby/30",
    seated: "bg-charcoal text-muted-foreground border-white/10"
};

export default function ReservationsPage() {
    const router = useRouter();
    const { tables, seatTable } = useRestaurant();
    const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);
    const [selectedReservation, setSelectedReservation] = useState<typeof INITIAL_RESERVATIONS[0] | null>(null);
    const [currentDate] = useState(new Date());
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<typeof INITIAL_RESERVATIONS[0]>>({});

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    const stats = {
        total: reservations.length,
        confirmed: reservations.filter(r => r.status === 'confirmed').length,
        pending: reservations.filter(r => r.status === 'pending').length,
        covers: reservations.reduce((sum, r) => sum + r.party, 0),
        vip: reservations.filter(r => r.isVip).length
    };

    // Handlers
    const handleSeat = () => {
        if (!selectedReservation) return;

        // Find table
        const table = tables.find(t => t.number === selectedReservation.table);

        if (!table) {
            alert(`Table ${selectedReservation.table} not found in floor plan.`);
            return;
        }

        if (table.status !== 'available') {
            if (!confirm(`Table ${table.number} is currently ${table.status}. Force seat?`)) {
                return;
            }
        }

        // Prepare guest object
        const guest: GuestToSeat = {
            id: `g-${selectedReservation.id}`,
            name: selectedReservation.name,
            party: selectedReservation.party,
            isVip: selectedReservation.isVip,
            notes: selectedReservation.notes,
            source: 'reservation'
        };

        // Execute Seat
        seatTable(table.id, guest);

        // Update local status
        updateStatus(selectedReservation.id, 'seated');

        // Close and redirect
        setSelectedReservation(null);
        router.push('/host');
    };

    const handleCancel = () => {
        if (!selectedReservation) return;
        if (confirm("Are you sure you want to cancel this reservation?")) {
            updateStatus(selectedReservation.id, 'cancelled');
            setSelectedReservation(null);
        }
    };

    const updateStatus = (id: string, newStatus: string) => {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    };

    const handleEditStart = () => {
        if (!selectedReservation) return;
        setEditForm({ ...selectedReservation });
        setIsEditing(true);
    };

    const handleEditSave = () => {
        if (!selectedReservation || !editForm) return;
        setReservations(prev => prev.map(r => r.id === selectedReservation.id ? { ...r, ...editForm } : r));
        setSelectedReservation({ ...selectedReservation, ...editForm } as typeof INITIAL_RESERVATIONS[0]);
        setIsEditing(false);
    };

    return (
        <div className="flex min-h-screen bg-void">
            <Sidebar />

            <main className="flex-1 ml-20 p-8">
                {/* Header */}
                <header className="mb-8 flex items-center justify-between animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Reservations</h1>
                        <p className="text-muted-foreground">Manage tonight's bookings</p>
                    </div>
                    <Button className="bg-gold hover:bg-gold/90 text-void font-semibold">
                        <Plus className="h-4 w-4 mr-2" />
                        New Reservation
                    </Button>
                </header>

                {/* Date Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-lg hover:bg-charcoal transition-colors">
                            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                        </button>
                        <div className="flex items-center gap-3">
                            <CalendarDays className="h-5 w-5 text-gold" />
                            <span className="text-xl font-semibold text-white">{formatDate(currentDate)}</span>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-charcoal transition-colors">
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search reservations..."
                                className="pl-10 pr-4 py-2 rounded-lg bg-charcoal border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 w-64"
                            />
                        </div>
                        <button className="p-2 rounded-lg bg-charcoal border border-white/10 hover:border-white/20 transition-colors">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-5 gap-4 mb-6 stagger-children">
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold text-emerald">{stats.confirmed}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Confirmed</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold text-gold">{stats.pending}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold text-white">{stats.covers}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Covers</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold text-gold">{stats.vip}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">VIP</p>
                    </div>
                </div>

                {/* Reservations List */}
                <Card className="glass-card-elevated">
                    <CardHeader className="border-b border-white/5">
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gold" />
                            Tonight's Reservations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {reservations.map((reservation, i) => (
                                <div
                                    key={reservation.id}
                                    className="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition-colors animate-fade-in"
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                    onClick={() => {
                                        setSelectedReservation(reservation);
                                        setIsEditing(false);
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Time */}
                                        <div className="w-20 text-center">
                                            <p className="text-lg font-bold text-gold font-mono">{reservation.time}</p>
                                        </div>

                                        {/* Guest Info */}
                                        <div className="flex items-center gap-3">
                                            <Avatar alt={reservation.name} size="md" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-white">{reservation.name}</span>
                                                    {reservation.isVip && <Badge variant="vip"><Star className="h-3 w-3 mr-1" />VIP</Badge>}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" /> {reservation.party}
                                                    </span>
                                                    <span>Table {reservation.table}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {reservation.notes && (
                                            <span className="text-xs text-muted-foreground max-w-[200px] truncate">
                                                {reservation.notes}
                                            </span>
                                        )}
                                        <Badge className={`${statusStyles[reservation.status]} capitalize`}>
                                            {reservation.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Reservation Detail Modal */}
                <Modal
                    open={!!selectedReservation}
                    onClose={() => setSelectedReservation(null)}
                    title={isEditing ? "Edit Reservation" : "Reservation Details"}
                    size="md"
                >
                    {selectedReservation && (
                        <div className="space-y-6">
                            {/* Guest Header */}
                            <div className="flex items-center gap-4">
                                <Avatar alt={selectedReservation.name} size="xl" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-bold text-white">{selectedReservation.name}</h3>
                                        {selectedReservation.isVip && <Badge variant="vip"><Star className="h-3 w-3 mr-1" />VIP</Badge>}
                                    </div>
                                    <Badge className={`${statusStyles[selectedReservation.status]} capitalize`}>
                                        {selectedReservation.status}
                                    </Badge>
                                </div>
                            </div>

                            {/* Details Grid or Edit Form */}
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Time</Label>
                                            <Input
                                                value={editForm.time}
                                                onChange={e => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Party Size</Label>
                                            <Input
                                                type="number"
                                                value={editForm.party}
                                                onChange={e => setEditForm(prev => ({ ...prev, party: parseInt(e.target.value) }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Table</Label>
                                            <Input
                                                type="number"
                                                value={editForm.table}
                                                onChange={e => setEditForm(prev => ({ ...prev, table: parseInt(e.target.value) }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <Input
                                                value={editForm.phone}
                                                onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Notes</Label>
                                        <Input
                                            value={editForm.notes}
                                            onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="glass-card p-4">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Time</p>
                                        <p className="text-lg font-bold text-gold font-mono">{selectedReservation.time}</p>
                                    </div>
                                    <div className="glass-card p-4">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Party Size</p>
                                        <p className="text-lg font-bold text-white">{selectedReservation.party} guests</p>
                                    </div>
                                    <div className="glass-card p-4">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Table</p>
                                        <p className="text-lg font-bold text-white">#{selectedReservation.table}</p>
                                    </div>
                                    <div className="glass-card p-4">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Contact</p>
                                        <p className="text-sm text-white">{selectedReservation.phone}</p>
                                    </div>
                                </div>
                            )}

                            {/* Notes Display (Non-Edit Mode) */}
                            {!isEditing && selectedReservation.notes && (
                                <div className="p-4 rounded-lg bg-charcoal border border-white/5">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Notes</p>
                                    <p className="text-white">{selectedReservation.notes}</p>
                                </div>
                            )}

                            {/* Special Requests */}
                            {!isEditing && selectedReservation.requests && selectedReservation.requests.length > 0 && (
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Special Requests</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedReservation.requests.map((req, i) => (
                                            <Badge key={i} variant="outline">{req}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-white/10">
                                {isEditing ? (
                                    <>
                                        <Button
                                            className="flex-1 bg-emerald hover:bg-emerald/90 text-void font-semibold"
                                            onClick={handleEditSave}
                                        >
                                            Save Changes
                                        </Button>
                                        <Button
                                            className="flex-1 bg-charcoal border border-white/10 hover:bg-slate text-white font-semibold"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel Edit
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        {selectedReservation.status !== 'cancelled' && selectedReservation.status !== 'seated' && (
                                            <Button
                                                className="flex-1 bg-emerald hover:bg-emerald/90 text-void font-semibold"
                                                onClick={handleSeat}
                                            >
                                                Seat Guest
                                            </Button>
                                        )}
                                        <Button
                                            className="flex-1 bg-charcoal border border-white/10 hover:bg-slate text-white font-semibold"
                                            onClick={handleEditStart}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            className="bg-ruby/20 hover:bg-ruby/30 text-ruby font-semibold px-4"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>
            </main>
        </div>
    );
}

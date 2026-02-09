"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { useState, useEffect } from "react";
import { useRestaurant, TableData, GuestToSeat } from "@/context/RestaurantContext";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
    Users,
    Clock,
    Star,
    Check,
    X,
    UserPlus,
    AlertTriangle,
    ArrowRight,
    DollarSign,
    CreditCard
} from "lucide-react";

const statusColors: Record<string, string> = {
    available: 'status-available',
    occupied: 'status-occupied',
    reserved: 'status-vip',
    alert: 'status-alert',
};

const sizeClasses: Record<number, string> = {
    2: 'size-2',
    4: 'size-4',
    6: 'size-6',
    8: 'size-8',
};

export function FloorPlanView() {
    const { tables, seatTable, clearTable, updateTableData, waitingGuests } = useRestaurant();
    const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
    const [showSeatModal, setShowSeatModal] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<GuestToSeat | null>(null);
    const [now, setNow] = useState(Date.now());

    const router = useRouter();
    const searchParams = useSearchParams();
    const seatGuestId = searchParams.get('seatGuestId');
    const targetGuest = seatGuestId ? waitingGuests.find(g => g.id === seatGuestId) : null;

    // Update timer every minute
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    const getTimeSeated = (seatedAt?: number) => {
        if (!seatedAt) return null;
        return Math.floor((now - seatedAt) / 60000);
    };

    const handleTableClick = (table: TableData) => {
        if (targetGuest) {
            if (table.status !== 'available') return;
            // Confirm seating
            if (confirm(`Seat ${targetGuest.name} at Table ${table.number}?`)) {
                seatTable(table.id, targetGuest);
                router.replace('/dashboard/floor'); // Clear mode
            }
            return;
        }

        setSelectedTable(table);
        if (table.status === 'available' || table.status === 'reserved') {
            setShowSeatModal(true);
        }
    };

    const handleSeatGuest = (guest: GuestToSeat) => {
        if (!selectedTable) return;
        seatTable(selectedTable.id, guest);
        setShowSeatModal(false);
        setSelectedTable(null);
        setSelectedGuest(null);
    };

    const handleWalkIn = () => {
        if (!selectedTable) return;
        const walkIn: GuestToSeat = {
            id: `walkin-${Date.now()}`,
            name: 'Walk-In',
            party: 2,
            isVip: false,
            source: 'walkin'
        };
        seatTable(selectedTable.id, walkIn);
        setShowSeatModal(false);
        setSelectedTable(null);
    };

    const handleClearTable = (tableId: string) => {
        clearTable(tableId);
        setSelectedTable(null);
    };

    return (
        <>
            {targetGuest && (
                <div className="mb-4 p-4 bg-gold/10 border border-gold rounded-lg flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3">
                        <Badge variant="vip" className="bg-gold text-void">SEATING MODE</Badge>
                        <div>
                            <p className="font-bold text-white">Seating {targetGuest.name}</p>
                            <p className="text-sm text-gold">Party of {targetGuest.party} • Select an available table</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.replace('/dashboard/floor')}
                        className="text-muted-foreground hover:text-white"
                    >
                        Cancel
                    </Button>
                </div>
            )}

            <div className="floor-plan-container relative h-[600px] bg-charcoal/50 bg-aurora rounded-xl border border-white/5 overflow-hidden shadow-2xl">
                {tables.map((table) => {
                    const timeSeated = getTimeSeated(table.seatedAt);
                    const isLong = timeSeated && timeSeated > 60;
                    const isSuitable = targetGuest ? (table.status === 'available' && table.capacity >= targetGuest.party) : false;
                    const isDimmed = targetGuest && !isSuitable;

                    return (
                        <button
                            key={table.id}
                            onClick={() => handleTableClick(table)}
                            className={`floor-table absolute transition-all duration-300 rounded-full flex items-center justify-center border-2 
                                ${statusColors[table.status]} 
                                ${sizeClasses[table.capacity] || 'size-4'} 
                                ${isLong ? 'animate-pulse-alert' : ''}
                                ${table.status === 'occupied' || table.status === 'reserved' ? 'animate-breathe' : ''}
                                ${isSuitable ? 'ring-2 ring-gold ring-offset-2 ring-offset-charcoal scale-110 z-10' : ''}
                                ${isDimmed ? 'opacity-30 grayscale cursor-not-allowed' : 'opacity-100 hover:scale-105 cursor-pointer'}
                            `}
                            style={{ left: `${table.x}%`, top: `${table.y}%` }}
                            title={table.guestName || `Table ${table.number}`}
                            disabled={!!targetGuest && !isSuitable}
                        >
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-white shadow-sm">{table.number}</span>
                                {table.isVip && <Star className="h-3 w-3 fill-gold text-gold" />}
                                {table.paymentStatus === 'requested' && <DollarSign className="h-3 w-3 text-emerald animate-bounce" />}
                                {table.paymentStatus === 'paid' && <Check className="h-3 w-3 text-emerald" />}
                            </div>
                        </button>
                    );
                })}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 flex gap-4 text-xs bg-black/40 p-2 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald" />
                        <span className="text-muted-foreground">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-sapphire" />
                        <span className="text-muted-foreground">Occupied</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gold" />
                        <span className="text-muted-foreground">Reserved</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-ruby animate-pulse" />
                        <span className="text-muted-foreground">Needs Attention</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="absolute top-4 right-4 flex gap-4 text-xs">
                    <div className="glass-card px-3 py-2">
                        <span className="text-muted-foreground">Available: </span>
                        <span className="font-bold text-emerald">{tables.filter(t => t.status === 'available').length}</span>
                    </div>
                    <div className="glass-card px-3 py-2">
                        <span className="text-muted-foreground">Occupied: </span>
                        <span className="font-bold text-sapphire">{tables.filter(t => t.status === 'occupied').length}</span>
                    </div>
                    <div className="glass-card px-3 py-2">
                        <span className="text-muted-foreground">Covers: </span>
                        <span className="font-bold text-white">
                            {tables.filter(t => t.status === 'occupied').reduce((sum, t) => sum + (t.guestCount || 0), 0)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Table Detail Modal - Occupied */}
            <Modal
                open={!!selectedTable && selectedTable.status === 'occupied'}
                onClose={() => setSelectedTable(null)}
                title={`Table ${selectedTable?.number}`}
                size="md"
            >
                {selectedTable && selectedTable.status === 'occupied' && (
                    <div className="space-y-4">
                        {/* Guest Info */}
                        <div className="flex items-center gap-4">
                            <Avatar alt={selectedTable.guestName || ''} size="lg" />
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-xl text-white">{selectedTable.guestName}</span>
                                    {selectedTable.isVip && <Badge variant="vip"><Star className="h-3 w-3 mr-1" />VIP</Badge>}
                                </div>
                                <p className="text-muted-foreground">Server: {selectedTable.server || 'Unassigned'}</p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="glass-card p-3 text-center">
                                <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                <p className="text-lg font-bold">{selectedTable.guestCount}</p>
                                <p className="text-xs text-muted-foreground">Guests</p>
                            </div>
                            <div className="glass-card p-3 text-center">
                                <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                <p className={`text-lg font-bold ${getTimeSeated(selectedTable.seatedAt)! > 60 ? 'text-ruby' : 'text-white'}`}>
                                    {getTimeSeated(selectedTable.seatedAt)}m
                                </p>
                                <p className="text-xs text-muted-foreground">Seated</p>
                            </div>
                            <div className="glass-card p-3 text-center">
                                <p className="text-lg font-bold text-gold">$245</p>
                                <p className="text-xs text-muted-foreground">Running Total</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-white/10">
                            {selectedTable.paymentStatus === 'requested' ? (
                                <Button
                                    className="flex-1 bg-emerald hover:bg-emerald/90 text-void animate-pulse"
                                    onClick={() => {
                                        updateTableData(selectedTable.id, { paymentStatus: 'paid' });
                                        setSelectedTable(null);
                                    }}
                                >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Process Payment (${selectedTable.orderTotal?.toFixed(2)})
                                </Button>
                            ) : (
                                <Button className="flex-1 bg-gold hover:bg-gold/90 text-void">
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    View Order
                                </Button>
                            )}

                            <Button
                                className="bg-ruby/20 hover:bg-ruby/30 text-ruby border border-ruby/30"
                                onClick={() => handleClearTable(selectedTable.id)}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Alert Table Modal */}
            <Modal
                open={!!selectedTable && selectedTable.status === 'alert'}
                onClose={() => setSelectedTable(null)}
                title={`⚠️ Table ${selectedTable?.number} - Attention Needed`}
                size="md"
            >
                {selectedTable && selectedTable.status === 'alert' && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-ruby/20 border border-ruby/30">
                            <div className="flex items-center gap-2 text-ruby mb-2">
                                <AlertTriangle className="h-5 w-5" />
                                <span className="font-bold">Long Dwell Time</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Table has been seated for {getTimeSeated(selectedTable.seatedAt)} minutes.
                                Consider checking on the guest or offering dessert.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <Avatar alt={selectedTable.guestName || ''} size="lg" />
                            <div>
                                <span className="font-bold text-white">{selectedTable.guestName}</span>
                                <p className="text-sm text-muted-foreground">{selectedTable.guestCount} guests</p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-white/10">
                            <Button className="flex-1 bg-emerald hover:bg-emerald/90 text-void">
                                <Check className="h-4 w-4 mr-2" />
                                Mark Checked
                            </Button>
                            <Button
                                className="bg-ruby/20 hover:bg-ruby/30 text-ruby border border-ruby/30"
                                onClick={() => handleClearTable(selectedTable.id)}
                            >
                                Clear Table
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Seat Guest Modal */}
            <Modal
                open={showSeatModal}
                onClose={() => { setShowSeatModal(false); setSelectedTable(null); }}
                title={`Seat Table ${selectedTable?.number}`}
                size="lg"
            >
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        Table {selectedTable?.number} • Capacity: {selectedTable?.capacity} guests
                    </p>

                    {/* Waitlist */}
                    {waitingGuests.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Users className="h-4 w-4 text-gold" />
                                From Waitlist
                            </h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {waitingGuests.filter(g => g.party <= (selectedTable?.capacity || 0)).map((guest) => (
                                    <button
                                        key={guest.id}
                                        onClick={() => handleSeatGuest(guest)}
                                        className={`w-full p-3 rounded-lg text-left glass-card hover:border-gold/30 transition-all ${selectedGuest?.id === guest.id ? 'border-gold' : ''
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar alt={guest.name} size="sm" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{guest.name}</span>
                                                        {guest.isVip && <Badge variant="vip">VIP</Badge>}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">Party of {guest.party}</span>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {waitingGuests.filter(g => g.party <= (selectedTable?.capacity || 0)).length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No matching guests on waitlist</p>
                    )}

                    {/* Walk-in option */}
                    <div className="pt-4 border-t border-white/10">
                        <Button
                            className="w-full bg-gold hover:bg-gold/90 text-void font-semibold"
                            onClick={handleWalkIn}
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Seat Walk-In
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Types
export interface OrderItem {
    id: string;
    name: string;
    price: number;
    station: string;
    course: string;
    mods?: string[];
}

export interface KitchenTicket {
    id: string;
    tableNumber: number;
    server: string;
    createdAt: number;
    status: 'new' | 'cooking' | 'ready' | 'delivered';
    priority?: 'vip' | 'rush';
    items: Array<{
        id: string; // Added ID for partial bumping
        name: string;
        mods: string[];
        station: string;
        status: 'new' | 'cooking' | 'ready';
        price: number;
        course?: string;
    }>;
}

export interface TableData {
    id: string;
    number: number;
    capacity: number;
    x: number;
    y: number;
    status: 'available' | 'occupied' | 'reserved' | 'alert';
    guestName?: string;
    guestCount?: number;
    seatedAt?: number;
    isVip?: boolean;
    reservationId?: string;
    server?: string;
    currentCourse?: 'seated' | 'drinks' | 'apps' | 'mains' | 'dessert' | 'check';
    paymentStatus?: 'none' | 'requested' | 'paid';
    orderTotal?: number;
    items?: string[]; // Simplified list of item names for display
}

export interface GuestToSeat {
    id: string;
    name: string;
    party: number;
    isVip: boolean;
    notes?: string;
    source: 'reservation' | 'waitlist' | 'walkin';
}

interface RestaurantState {
    // Kitchen tickets
    tickets: KitchenTicket[];
    addTicket: (ticket: KitchenTicket) => void;
    updateTicketStatus: (ticketId: string, status: KitchenTicket['status']) => void;
    bumpTicket: (ticketId: string) => void;
    bumpItemsForStation: (ticketId: string, station: string) => void;
    updateItemStatus: (ticketId: string, itemId: string, status: 'new' | 'cooking' | 'ready') => void;

    // Tables
    tables: TableData[];
    seatTable: (tableId: string, guest: GuestToSeat) => void;
    clearTable: (tableId: string) => void;
    updateTableStatus: (tableId: string, status: TableData['status']) => void;
    updateTableData: (tableId: string, updates: Partial<TableData>) => void;

    // Waitlist for seating
    waitingGuests: GuestToSeat[];
    addToWaitlist: (guest: GuestToSeat) => void;
    removeFromWaitlist: (guestId: string) => void;

    // Delivery
    deliverTicket: (ticketId: string) => void;
    deliverItemsByCourse: (tableNumber: number, course: string) => void;

    // System
    resetSystem: () => void;
    startSystem: () => void;
    stopSystem: () => void;
    systemRunning: boolean;

    // Notifications / AI Ticker
    notifications: string[];
}

// Initial tables data
// Initial tables data
const INITIAL_TABLES: TableData[] = [];
const SERVERS = ["Maria", "James", "Sarah", "David", "Michael"];

// Generate 40 tables programmatically (Matches Backend Logic)
let count = 1;
for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 8; c++) {
        let cap = 4;
        if (count % 3 === 0) cap = 2;
        else if (count % 5 === 0) cap = 6;
        else if (count % 7 === 0) cap = 8;

        const assignedServer = SERVERS[(count - 1) % SERVERS.length];

        INITIAL_TABLES.push({
            id: `t${count}`,
            number: count,
            capacity: cap,
            x: 5 + (c * 11),
            y: 10 + (r * 18),
            status: 'available',
            server: assignedServer,
            paymentStatus: 'none',
            orderTotal: 0,
            items: []
        });
        count++;
    }
}

// Initial waiting guests
const INITIAL_WAITING: GuestToSeat[] = [
    { id: 'w1', name: 'Anderson, Robert', party: 4, isVip: true, notes: 'Celebrating promotion', source: 'waitlist' },
    { id: 'w2', name: 'Kim, Jessica', party: 2, isVip: false, source: 'waitlist' },
    { id: 'w3', name: 'Martinez, Carlos', party: 6, isVip: false, notes: 'Large party', source: 'waitlist' },
];

// Initial kitchen tickets
const INITIAL_TICKETS: KitchenTicket[] = [];

const RestaurantContext = createContext<RestaurantState | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
    const [tickets, setTickets] = useState<KitchenTicket[]>(INITIAL_TICKETS);
    const [tables, setTables] = useState<TableData[]>(INITIAL_TABLES);
    const [waitingGuests, setWaitingGuests] = useState<GuestToSeat[]>(INITIAL_WAITING);
    const [systemRunning, setSystemRunning] = useState(false);
    const [notifications, setNotifications] = useState<string[]>([]);

    // Backend API URL
    const API_URL = 'http://localhost:8000/api/v1/integrations';
    const [recentlyDelivered, setRecentlyDelivered] = useState<Set<string>>(new Set());

    const addNotification = useCallback((message: string) => {
        setNotifications(prev => [message, ...prev].slice(0, 10));
    }, []);

    // Poll for Data (Tickets, Tables, Waitlist)
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Tickets
                const resTickets = await fetch(`${API_URL}/kitchen/queue`);
                if (resTickets.ok) {
                    const queue = await resTickets.json();
                    const mappedTickets: KitchenTicket[] = queue
                        .filter((order: any) => !recentlyDelivered.has(order.order_id))
                        .map((order: any) => ({
                            id: order.order_id,
                            tableNumber: order.table,
                            server: order.server || "Server",
                            createdAt: order.created_at ? new Date(order.created_at).getTime() : Date.now(),
                            status: order.status === 'open' ? 'new' : order.status,
                            priority: undefined,
                            items: Object.entries(order.items || {}).map(([id, item]: [string, any]) => {
                                // Infer station from item name if not provided
                                let station = item.station;
                                if (!station || station.toLowerCase() === 'grill') {
                                    const name = (item.name || '').toLowerCase();
                                    if (name.includes('drink') || name.includes('martini') || name.includes('wine') || name.includes('cabernet') || name.includes('marg')) {
                                        station = 'Bar';
                                    } else if (name.includes('app') || name.includes('tartare') || name.includes('cocktail') || name.includes('caviar')) {
                                        station = 'Garde Manger';
                                    } else if (name.includes('tender') || name.includes('fry') || name.includes('fries')) {
                                        station = 'Fry';
                                    } else if (name.includes('dessert') || name.includes('brownie') || name.includes('cake') || name.includes('soufflé')) {
                                        station = 'Pastry';
                                    } else if (!station) {
                                        station = 'Grill'; // Only default to Grill if truly unknown
                                    }
                                }

                                // Normalize capitalization
                                const normalizedStation = station.charAt(0).toUpperCase() + station.slice(1).toLowerCase();

                                return {
                                    id: id,
                                    name: item.name,
                                    mods: [],
                                    station: normalizedStation,
                                    status: item.status || 'new',
                                    price: item.price || 0,
                                    course: item.course || 'Mains'
                                };
                            })
                        }));
                    setTickets(prev => JSON.stringify(prev) !== JSON.stringify(mappedTickets) ? mappedTickets : prev);
                }

                // 2. Tables
                const resTables = await fetch(`${API_URL}/tables`);
                if (resTables.ok) {
                    const tablesData = await resTables.json();
                    setTables(prev => JSON.stringify(prev) !== JSON.stringify(tablesData) ? tablesData : prev);
                }

                // 3. Waitlist
                const resWaitlist = await fetch(`${API_URL}/waitlist`);
                if (resWaitlist.ok) {
                    const waitlistData = await resWaitlist.json();
                    setWaitingGuests(prev => JSON.stringify(prev) !== JSON.stringify(waitlistData) ? waitlistData : prev);
                }

                // 4. System Status
                const resStatus = await fetch(`${API_URL}/system/status`);
                if (resStatus.ok) {
                    const statusData = await resStatus.json();
                    setSystemRunning(statusData.running);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 2000); // Poll every 2s
        return () => clearInterval(interval);
    }, []);

    // Kitchen ticket functions
    const addTicket = useCallback(async (ticket: KitchenTicket) => {
        // Optimistic update
        setTickets(prev => [ticket, ...prev]);
        addNotification(`Order: Table ${ticket.tableNumber} sent to ${ticket.items[0]?.station || 'Kitchen'}`);

        // POST to backend
        try {
            const totalAmount = ticket.items.reduce((sum, item) => sum + item.price, 0);

            await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: ticket.id,
                    table_number: ticket.tableNumber,
                    server: ticket.server,
                    guest_count: 2, // Default
                    items: ticket.items.map(i => ({
                        item_id: Math.random().toString(36),
                        name: i.name,
                        quantity: 1,
                        price: i.price,
                        special_requests: i.mods,
                        course: i.course,
                        station: i.station
                    })),
                    total_amount: totalAmount
                })
            });
        } catch (e) {
            console.error("Failed to send order:", e);
        }
    }, [addNotification]);

    const updateTicketStatus = useCallback(async (ticketId: string, status: KitchenTicket['status']) => {
        // Optimistic update
        setTickets(prev => prev.map(t =>
            t.id === ticketId ? { ...t, status } : t
        ));

        // Call API
        try {
            await fetch(`${API_URL}/kitchen/orders/${ticketId}/status?status=${status}`, {
                method: 'PATCH'
            });
        } catch (e) {
            console.error("Failed to update status:", e);
        }
    }, []);

    const bumpTicket = useCallback(async (ticketId: string) => {
        // Optimistic update - set all items to ready and then check if ticket can be ready
        setTickets(prev => prev.map(t => {
            if (t.id !== ticketId) return t;
            const updatedItems = t.items.map(i => ({ ...i, status: 'ready' as const }));
            return { ...t, items: updatedItems, status: 'ready' as const };
        }));
        addNotification(`Kitchen: Order ready for pickup`);

        // Call API
        try {
            await fetch(`${API_URL}/kitchen/bump-order/${ticketId}`, {
                method: 'POST'
            });
        } catch (e) {
            console.error("Failed to bump ticket:", e);
        }
    }, [addNotification]);

    const updateItemStatus = useCallback(async (ticketId: string, itemId: string, status: 'new' | 'cooking' | 'ready') => {
        // Optimistic update
        setTickets(prev => prev.map(t => {
            if (t.id !== ticketId) return t;
            const updatedItems = t.items.map(i => i.id === itemId ? { ...i, status } : i);
            // If all items are ready, set ticket to ready
            const allReady = updatedItems.every(i => i.status === 'ready');
            return { ...t, items: updatedItems, status: allReady ? 'ready' : t.status };
        }));

        // Call API for specific item
        try {
            await fetch(`${API_URL}/kitchen/bump/${itemId}`, { method: 'POST' });
        } catch (e) { console.error(e); }
    }, []);

    const bumpItemsForStation = useCallback(async (ticketId: string, station: string) => {
        // Optimistic update
        setTickets(prev => prev.map(t => {
            if (t.id !== ticketId) return t;
            const updatedItems = t.items.map(i => {
                if (i.station.toLowerCase() === station.toLowerCase()) {
                    return { ...i, status: 'ready' as const };
                }
                return i;
            });
            const allReady = updatedItems.every(i => i.status === 'ready');
            return { ...t, items: updatedItems, status: allReady ? 'ready' : t.status };
        }));

        addNotification(`${station}: Station items completed`);

        // Note: For now we'll just optimistically update frontend. 
        // Backend currently doesn't have a specific 'bump station' endpoint, but we can call bump/{id} for each item.
        try {
            const ticket = tickets.find(t => t.id === ticketId);
            if (ticket) {
                const stationItems = ticket.items.filter(i => i.station.toLowerCase() === station.toLowerCase());
                for (const item of stationItems) {
                    await fetch(`${API_URL}/kitchen/bump/${item.id}`, { method: 'POST' });
                }
            }
        } catch (e) { console.error(e); }
    }, [addNotification, tickets]);

    const deliverItemsByCourse = useCallback(async (tableNumber: number, course: string) => {
        addNotification(`Service: ${course} delivered to Table ${tableNumber}`);
        // For now, this is a placeholder for more advanced course-aware delivery.
        // It could find tickets for this table/course and mark them delivered.
    }, [addNotification]);

    const deliverTicket = useCallback(async (ticketId: string) => {
        // Optimistic update
        setRecentlyDelivered(prev => new Set(prev).add(ticketId));
        setTickets(prev => prev.filter(t => t.id !== ticketId));
        addNotification(`Service: Order delivered to table`);

        // Call API
        try {
            await fetch(`${API_URL}/kitchen/deliver-order/${ticketId}`, {
                method: 'POST'
            });
        } catch (e) {
            console.error("Failed to deliver ticket:", e);
        }
    }, [addNotification, API_URL]);

    // Table functions
    const seatTable = useCallback(async (tableId: string, guest: GuestToSeat) => {
        // Optimistic update
        setTables(prev => prev.map(t =>
            t.id === tableId ? {
                ...t,
                status: 'occupied' as const,
                guestName: guest.name,
                guestCount: guest.party,
                seatedAt: Date.now(),
                isVip: guest.isVip,
            } : t
        ));
        setWaitingGuests(prev => prev.filter(w => w.id !== guest.id));
        addNotification(`Host: ${guest.name} (${guest.party}) seated at Table`); // simplified table lookup

        // API
        try {
            await fetch(`${API_URL}/tables/${tableId}/seat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(guest)
            });
        } catch (e) { console.error(e); }
    }, [addNotification]);

    const clearTable = useCallback(async (tableId: string) => {
        setTables(prev => prev.map(t =>
            t.id === tableId ? {
                ...t,
                status: 'available' as const,
                guestName: undefined,
                guestCount: undefined,
                seatedAt: undefined,
                isVip: undefined,
                currentCourse: 'seated',
                paymentStatus: 'none',
                orderTotal: 0,
                items: [],
            } : t
        ));
        addNotification(`Bus: Table cleared and ready`);

        try {
            await fetch(`${API_URL}/tables/${tableId}/clear`, { method: 'POST' });
        } catch (e) { console.error(e); }
    }, [addNotification]);

    const updateTableStatus = useCallback(async (tableId: string, status: TableData['status']) => {
        setTables(prev => prev.map(t =>
            t.id === tableId ? { ...t, status } : t
        ));
    }, []);

    const updateTableData = useCallback((tableId: string, updates: Partial<TableData>) => {
        setTables(prev => prev.map(t =>
            t.id === tableId ? { ...t, ...updates } : t
        ));
    }, []);

    // Waitlist functions
    const addToWaitlist = useCallback(async (guest: GuestToSeat) => {
        setWaitingGuests(prev => [...prev, guest]);
        try {
            await fetch(`${API_URL}/waitlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(guest)
            });
        } catch (e) { console.error(e); }
    }, []);



    const removeFromWaitlist = useCallback(async (guestId: string) => {
        setWaitingGuests(prev => prev.filter(w => w.id !== guestId));
        try {
            await fetch(`${API_URL}/waitlist/${guestId}`, { method: 'DELETE' });
        } catch (e) { console.error(e); }
    }, []);

    const startSystem = useCallback(async () => {
        setSystemRunning(true);
        try {
            await fetch(`${API_URL}/system/start`, { method: 'POST' });
        } catch (e) { console.error(e); }
    }, []);

    const stopSystem = useCallback(async () => {
        setSystemRunning(false);
        try {
            await fetch(`${API_URL}/system/stop`, { method: 'POST' });
        } catch (e) { console.error(e); }
    }, []);

    const resetSystem = useCallback(async () => {
        // Optimistic clear
        setTickets([]);
        setWaitingGuests([]);
        setTables(prev => prev.map(t => ({
            ...t,
            status: 'available',
            guestName: undefined,
            guestCount: undefined,
            seatedAt: undefined,
            isVip: undefined,
            currentCourse: 'seated',
            paymentStatus: 'none',
            orderTotal: 0,
            items: []
        })));

        try {
            await fetch(`${API_URL}/system/reset`, { method: 'POST' });
        } catch (e) { console.error(e); }
    }, []);

    // AI "Chatter" generator
    React.useEffect(() => {
        const messages = [
            "AI: Analyzing table turnover rates...",
            "AI: Suggesting wine pairings for Table 4",
            "Stock: Ribeye inventory low (4 remaining)",
            "Weather: Rain expected, patio closing suggested",
            "Trend: 'Spicy Tuna' popularity +15%",
            "Kitchen: Grill station load high",
            "Service: 3 VIPs currently seated"
        ];
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const msg = messages[Math.floor(Math.random() * messages.length)];
                addNotification(msg);
            }
        }, 12000);
        return () => clearInterval(interval);
    }, [addNotification]);


    return (
        <RestaurantContext.Provider value={{
            tickets,
            addTicket,
            updateTicketStatus,
            bumpTicket,
            bumpItemsForStation,
            updateItemStatus,
            deliverTicket,
            deliverItemsByCourse,
            tables,
            seatTable,
            clearTable,
            updateTableStatus,
            updateTableData,
            waitingGuests,
            addToWaitlist,
            removeFromWaitlist,
            resetSystem,
            startSystem,
            stopSystem,
            systemRunning,
            notifications
        }}>
            {children}
        </RestaurantContext.Provider>
    );
}

export function useRestaurant() {
    const context = useContext(RestaurantContext);
    if (!context) {
        throw new Error('useRestaurant must be used within RestaurantProvider');
    }
    return context;
}

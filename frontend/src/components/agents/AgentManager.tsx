'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRestaurant, TableData, KitchenTicket } from '@/context/RestaurantContext';
import { MENU_CATEGORIES, MenuItem } from '@/lib/data/menu';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Square, Bot, Utensils } from "lucide-react";

// Course states
type AgentState =
    | 'IDLE'
    | 'SEATED'
    | 'ORDERING_APPS' | 'WAITING_APPS' | 'EATING_APPS'
    | 'ORDERING_MAINS' | 'WAITING_MAINS' | 'EATING_MAINS'
    | 'ORDERING_DESSERT' | 'WAITING_DESSERT' | 'EATING_DESSERT'
    | 'PAYING' | 'LEFT';

// Dining patterns - determines course flow
type DiningPattern = 'full_course' | 'quick_lunch' | 'drinks_only' | 'no_dessert' | 'dessert_only';

interface GuestAgent {
    id: string;
    name: string;
    tableId: string;
    tableNumber: number;
    state: AgentState;
    diningPattern: DiningPattern;
    currentAction: string;
    lastActionTime: number;
    currentTicketId: string | null;
    totalSpent: number;
}

const FIRST_NAMES = ["Alice", "Bob", "Charlie", "David", "Eva", "Frank", "Grace", "Henry", "Ivy", "Jack"];
const LAST_NAMES = ["Smith", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas"];

// 70% full course, 30% variations
const getDiningPattern = (): DiningPattern => {
    const roll = Math.random();
    if (roll < 0.70) return 'full_course';      // 70% - Full 3-course
    if (roll < 0.80) return 'quick_lunch';       // 10% - Just mains
    if (roll < 0.88) return 'no_dessert';        // 8% - Apps + Mains only
    if (roll < 0.95) return 'drinks_only';       // 7% - Just drinks/apps
    return 'dessert_only';                        // 5% - Coffee & dessert
};

const getPatternLabel = (pattern: DiningPattern): string => {
    const labels: Record<DiningPattern, string> = {
        'full_course': '🍽️ Full Course',
        'quick_lunch': '⚡ Quick Lunch',
        'drinks_only': '🍸 Drinks Only',
        'no_dessert': '🚫🍰 No Dessert',
        'dessert_only': '☕ Just Dessert'
    };
    return labels[pattern];
};

export function AgentManager() {
    const { tables, seatTable, addTicket, clearTable, updateTableData, tickets } = useRestaurant();
    const [agents, setAgents] = useState<GuestAgent[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const ticketsRef = useRef<KitchenTicket[]>(tickets);
    const tablesRef = useRef<TableData[]>(tables);
    useEffect(() => { ticketsRef.current = tickets; }, [tickets]);
    useEffect(() => { tablesRef.current = tables; }, [tables]);

    // --- Agent Creation ---
    const createAgent = (table: TableData): GuestAgent => {
        const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        return {
            id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: `${firstName} ${lastName}`,
            tableId: table.id,
            tableNumber: table.number,
            state: 'IDLE',
            diningPattern: getDiningPattern(),
            currentAction: 'Waiting to be seated',
            lastActionTime: Date.now(),
            currentTicketId: null,
            totalSpent: 0
        };
    };

    const spawnAgent = (tableId: string) => {
        const table = tables.find(t => t.id === tableId);
        if (!table || table.status !== 'available') return;

        const newAgent = createAgent(table);
        seatTable(table.id, {
            id: newAgent.id,
            name: newAgent.name + " (Bot)",
            party: Math.floor(Math.random() * 4) + 1,
            isVip: Math.random() > 0.85,
            source: 'walkin',
        });

        newAgent.state = 'SEATED';
        newAgent.currentAction = 'Looking at menu...';
        newAgent.lastActionTime = Date.now();
        setAgents(prev => [...prev, newAgent]);
    };

    const killAgent = (agentId: string) => {
        const agent = agents.find(a => a.id === agentId);
        if (agent) {
            const table = tables.find(t => t.id === agent.tableId);
            if (table && table.status === 'occupied') clearTable(table.id);
        }
        setAgents(prev => prev.filter(a => a.id !== agentId));
    };

    const killAllAgents = () => {
        agents.forEach(agent => {
            const table = tables.find(t => t.id === agent.tableId);
            if (table && table.status === 'occupied') clearTable(table.id);
        });
        setAgents([]);
        setIsRunning(false);
    };

    // --- Course Selection ---
    const selectApps = (): MenuItem[] => {
        const items: MenuItem[] = [];
        const drinks = MENU_CATEGORIES['Drinks'];
        items.push(drinks[Math.floor(Math.random() * drinks.length)]);
        const apps = MENU_CATEGORIES['Appetizers'];
        items.push(apps[Math.floor(Math.random() * apps.length)]);
        return items;
    };

    const selectMains = (): MenuItem[] => {
        const items: MenuItem[] = [];
        const mains = MENU_CATEGORIES['Mains'];
        items.push(mains[Math.floor(Math.random() * mains.length)]);
        const sides = MENU_CATEGORIES['Sides'];
        if (sides?.length > 0) items.push(sides[Math.floor(Math.random() * sides.length)]);
        return items;
    };

    const selectDessert = (): MenuItem[] => {
        const items: MenuItem[] = [];
        const desserts = MENU_CATEGORIES['Desserts'];
        items.push(desserts[Math.floor(Math.random() * desserts.length)]);
        if (Math.random() > 0.6) {
            const drinks = MENU_CATEGORIES['Drinks'];
            items.push(drinks[Math.floor(Math.random() * drinks.length)]);
        }
        return items;
    };

    const selectDrinksOnly = (): MenuItem[] => {
        const items: MenuItem[] = [];
        const drinks = MENU_CATEGORIES['Drinks'];
        items.push(drinks[Math.floor(Math.random() * drinks.length)]);
        items.push(drinks[Math.floor(Math.random() * drinks.length)]);
        const apps = MENU_CATEGORIES['Appetizers'];
        items.push(apps[Math.floor(Math.random() * apps.length)]);
        return items;
    };

    const placeOrder = (agent: GuestAgent, items: MenuItem[], courseName: string): { ticketId: string, total: number } => {
        const ticketId = `tkt-${Date.now()}-${agent.tableNumber}-${courseName}`;
        const total = items.reduce((sum, i) => sum + i.price, 0);

        const ticket: KitchenTicket = {
            id: ticketId,
            tableNumber: agent.tableNumber,
            server: agent.tableNumber <= 5 ? "Maria" : "James",
            createdAt: Date.now(),
            status: 'new',
            items: items.map(i => ({
                id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                name: i.name,
                mods: [],
                station: i.station.charAt(0).toUpperCase() + i.station.slice(1),
                status: 'new' as const,
                price: i.price,
                course: i.course
            }))
        };
        addTicket(ticket);
        updateTableData(agent.tableId, {
            currentCourse: courseName === 'apps' ? 'apps' : courseName === 'mains' ? 'mains' : 'dessert',
            orderTotal: agent.totalSpent + total,
            items: items.map(i => i.name)
        });
        return { ticketId, total };
    };

    // --- Get Next State Based on Pattern ---
    const getNextStateAfterEating = (currentState: AgentState, pattern: DiningPattern): AgentState => {
        switch (pattern) {
            case 'full_course':
                if (currentState === 'EATING_APPS') return 'ORDERING_MAINS';
                if (currentState === 'EATING_MAINS') return 'ORDERING_DESSERT';
                return 'PAYING';

            case 'quick_lunch':
                // Skip apps, go straight to mains, then pay
                if (currentState === 'EATING_MAINS') return 'PAYING';
                return 'PAYING';

            case 'no_dessert':
                if (currentState === 'EATING_APPS') return 'ORDERING_MAINS';
                if (currentState === 'EATING_MAINS') return 'PAYING';
                return 'PAYING';

            case 'drinks_only':
                // Just apps/drinks then leave
                return 'PAYING';

            case 'dessert_only':
                // Just dessert then leave
                return 'PAYING';

            default:
                return 'PAYING';
        }
    };

    const getFirstOrderState = (pattern: DiningPattern): AgentState => {
        switch (pattern) {
            case 'quick_lunch': return 'ORDERING_MAINS';
            case 'dessert_only': return 'ORDERING_DESSERT';
            default: return 'ORDERING_APPS';
        }
    };

    // --- Simulation Loop ---
    const processAgents = () => {
        setAgents(prevAgents => {
            return prevAgents.map(agent => {
                const timeSinceLastAction = Date.now() - agent.lastActionTime;
                let nextState = agent.state;
                let nextAction = agent.currentAction;
                let nextActionTime = agent.lastActionTime;
                let nextTicketId = agent.currentTicketId;
                let nextTotalSpent = agent.totalSpent;

                switch (agent.state) {
                    case 'SEATED':
                        if (timeSinceLastAction > 2000) {
                            nextState = getFirstOrderState(agent.diningPattern);
                            nextAction = 'Ready to order...';
                            nextActionTime = Date.now();
                        }
                        break;

                    case 'ORDERING_APPS': {
                        const items = agent.diningPattern === 'drinks_only' ? selectDrinksOnly() : selectApps();
                        const { ticketId, total } = placeOrder(agent, items, 'apps');
                        nextState = 'WAITING_APPS';
                        nextAction = `Ordered: ${items.map(i => i.name).join(', ')}`;
                        nextActionTime = Date.now();
                        nextTicketId = ticketId;
                        nextTotalSpent = agent.totalSpent + total;
                        break;
                    }

                    case 'WAITING_APPS': {
                        const myTicket = ticketsRef.current.find(t => t.id === agent.currentTicketId);
                        if (!myTicket) {
                            nextState = 'EATING_APPS';
                            nextAction = 'Enjoying appetizers...';
                            nextActionTime = Date.now();
                            nextTicketId = null;
                        } else {
                            nextAction = myTicket.status === 'ready' ? '⏳ Server pickup...' : '⏳ Kitchen...';
                        }
                        break;
                    }

                    case 'EATING_APPS':
                        if (timeSinceLastAction > 5000) {
                            nextState = getNextStateAfterEating('EATING_APPS', agent.diningPattern);
                            nextAction = nextState === 'PAYING' ? 'Asking for check...' : 'Ready for next course...';
                            nextActionTime = Date.now();
                        }
                        break;

                    case 'ORDERING_MAINS': {
                        const items = selectMains();
                        const { ticketId, total } = placeOrder(agent, items, 'mains');
                        nextState = 'WAITING_MAINS';
                        nextAction = `Ordered: ${items.map(i => i.name).join(', ')}`;
                        nextActionTime = Date.now();
                        nextTicketId = ticketId;
                        nextTotalSpent = agent.totalSpent + total;
                        break;
                    }

                    case 'WAITING_MAINS': {
                        const myTicket = ticketsRef.current.find(t => t.id === agent.currentTicketId);
                        if (!myTicket) {
                            nextState = 'EATING_MAINS';
                            nextAction = 'Enjoying main course...';
                            nextActionTime = Date.now();
                            nextTicketId = null;
                        } else {
                            nextAction = myTicket.status === 'ready' ? '⏳ Server pickup...' : '⏳ Kitchen...';
                        }
                        break;
                    }

                    case 'EATING_MAINS':
                        if (timeSinceLastAction > 8000) {
                            nextState = getNextStateAfterEating('EATING_MAINS', agent.diningPattern);
                            nextAction = nextState === 'PAYING' ? 'Asking for check...' : 'Thinking about dessert...';
                            nextActionTime = Date.now();
                        }
                        break;

                    case 'ORDERING_DESSERT': {
                        const items = selectDessert();
                        const { ticketId, total } = placeOrder(agent, items, 'dessert');
                        nextState = 'WAITING_DESSERT';
                        nextAction = `Ordered: ${items.map(i => i.name).join(', ')}`;
                        nextActionTime = Date.now();
                        nextTicketId = ticketId;
                        nextTotalSpent = agent.totalSpent + total;
                        break;
                    }

                    case 'WAITING_DESSERT': {
                        const myTicket = ticketsRef.current.find(t => t.id === agent.currentTicketId);
                        if (!myTicket) {
                            nextState = 'EATING_DESSERT';
                            nextAction = 'Enjoying dessert...';
                            nextActionTime = Date.now();
                            nextTicketId = null;
                        } else {
                            nextAction = myTicket.status === 'ready' ? '⏳ Server pickup...' : '⏳ Kitchen...';
                        }
                        break;
                    }

                    case 'EATING_DESSERT':
                        if (timeSinceLastAction > 5000) {
                            nextState = 'PAYING';
                            nextAction = `Asking for check ($${agent.totalSpent.toFixed(0)})`;
                            nextActionTime = Date.now();
                            updateTableData(agent.tableId, { currentCourse: 'check' });
                        }
                        break;

                    case 'PAYING': {
                        const table = tablesRef.current.find(t => t.id === agent.tableId);

                        // Request payment if not already requested
                        if (table && table.currentCourse !== 'check' && table.paymentStatus !== 'requested' && table.paymentStatus !== 'paid') {
                            updateTableData(agent.tableId, { currentCourse: 'check', paymentStatus: 'requested' });
                        }

                        if (table && table.paymentStatus === 'paid') {
                            nextState = 'LEFT';
                            nextAction = `Paid $${agent.totalSpent.toFixed(0)}`;
                            nextActionTime = Date.now();
                        } else {
                            nextAction = `Waiting to pay ($${agent.totalSpent.toFixed(0)})`;
                        }
                        break;
                    }
                }

                if (nextState !== agent.state || nextAction !== agent.currentAction) {
                    return { ...agent, state: nextState, currentAction: nextAction, lastActionTime: nextActionTime, currentTicketId: nextTicketId, totalSpent: nextTotalSpent };
                }
                return agent;
            }).filter(a => a.state !== 'LEFT');
        });
    };

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (isRunning) intervalId = setInterval(processAgents, 1000);
        return () => { if (intervalId) clearInterval(intervalId); };
    }, [isRunning]);

    // --- UI ---
    const availableTables = tables.filter(t => t.status === 'available');

    const getStateColor = (state: AgentState) => {
        if (state.includes('WAITING')) return 'text-amber-400';
        if (state.includes('EATING')) return 'text-emerald';
        if (state === 'PAYING') return 'text-gold';
        if (state.includes('ORDERING')) return 'text-sapphire';
        return 'text-muted-foreground';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex gap-4">
                    <Button onClick={() => setIsRunning(!isRunning)} variant={isRunning ? "destructive" : "default"} className="w-28">
                        {isRunning ? <><Square className="mr-2 h-4 w-4" /> Pause</> : <><Play className="mr-2 h-4 w-4" /> Run</>}
                    </Button>
                    <Button variant="outline" onClick={killAllAgents} disabled={agents.length === 0}>Kill All</Button>
                </div>
                <div className="text-muted-foreground text-sm">Active: {agents.length} | Tables: {availableTables.length}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card border-white/10">
                    <CardHeader><CardTitle className="text-white flex items-center gap-2"><Utensils className="h-5 w-5 text-gold" /> Spawn Guests</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-3 gap-3">
                        {availableTables.length === 0 ? (
                            <div className="col-span-3 text-center text-muted-foreground py-8">No tables</div>
                        ) : (
                            availableTables.map(table => (
                                <Button key={table.id} variant="outline" onClick={() => spawnAgent(table.id)} className="h-14 flex flex-col gap-1 border-emerald/30 hover:bg-emerald/10">
                                    <span className="font-bold">T{table.number}</span>
                                    <span className="text-xs text-emerald">+ Guest</span>
                                </Button>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="glass-card border-white/10">
                    <CardHeader><CardTitle className="text-white flex items-center gap-2"><Bot className="h-5 w-5 text-emerald" /> Active Guests</CardTitle></CardHeader>
                    <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                        {agents.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">No guests</div>
                        ) : (
                            agents.map(agent => (
                                <div key={agent.id} className="p-3 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-white">{agent.name}</span>
                                            <Badge variant="outline" className="text-[10px]">T{agent.tableNumber}</Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground mb-1">{getPatternLabel(agent.diningPattern)}</div>
                                        <div className={`text-sm font-medium ${getStateColor(agent.state)}`}>{agent.state.replace(/_/g, ' ')}</div>
                                        <div className="text-xs text-muted-foreground">{agent.currentAction}</div>
                                        {agent.totalSpent > 0 && <div className="text-xs text-gold mt-1">${agent.totalSpent.toFixed(0)}</div>}
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => killAgent(agent.id)} className="text-ruby hover:text-ruby hover:bg-ruby/10">✕</Button>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

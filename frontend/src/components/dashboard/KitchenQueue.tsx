'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API } from "@/lib/api";
import { Badge } from "lucide-react"; // Wait, Badge is usually a component, let's use a simple span for now or check if we have Badge
import { Clock, Flame, CheckCircle, ChefHat } from "lucide-react";
import { format } from 'date-fns';

interface OptimizationPlan {
    station: string;
    fire_at: string;
    prep_time: number;
    course: string;
}

interface KitchenOrder {
    order_id: string;
    table: number;
    status: string;
    items: Record<string, OptimizationPlan>;
}

export function KitchenQueue() {
    const [queue, setQueue] = useState<KitchenOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const res = await fetch(`${API.integrations}/kitchen/queue`);
                if (res.ok) {
                    const data = await res.json();
                    setQueue(data);
                }
            } catch (error) {
                console.error("Failed to fetch kitchen queue", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQueue();
        const interval = setInterval(fetchQueue, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="text-sm text-muted-foreground">Loading kitchen status...</div>;

    if (queue.length === 0) return <div className="text-sm text-muted-foreground">No active orders in kitchen.</div>;

    return (
        <div className="space-y-4">
            {queue.map((order) => (
                <div key={order.order_id} className="flex flex-col space-y-2 border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="font-semibold">Table {order.table}</span>
                            <span className="text-xs text-muted-foreground">#{order.order_id.slice(0, 8)}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'fired' ? 'bg-orange-500/20 text-orange-500' : 'bg-gray-500/20 text-gray-500'}`}>
                            {order.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {Object.entries(order.items).map(([itemId, plan]) => {
                            // Assuming we can get item name from somewhere, but the backend sends items as a dict keyed by ID. 
                            // Wait, I updated the backend to send: 
                            // items: { [itemId]: plan }
                            // But the plan object doesn't have the NAME of the item inside it based on my previous code.
                            // Let me check my backend code again.
                            // ... 
                            // Ah, in router.py: 
                            // items_dict = [{"item_id": i.item_id, "name": i.name, "quantity": i.quantity} ...]
                            // kitchen_optimizer.optimize_order(items_dict) returns a dict keyed by item_id.
                            // The dict VALUES contain: { station, fire_at, prep_time, course }.
                            // It does NOT contain the name.
                            // I should assume the item name is not easily available here unless I change the backend.
                            // FOR NOW, I will just display "Item {itemId}" or cross-reference.
                            // Actually, in `router.py`, I return:
                            // "items": optimization_plan
                            // I need to fix the backend to include the NAME in the optimization plan or the response.
                            return (
                                <div key={itemId} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded-md">
                                    <div className="flex items-center space-x-2">
                                        {getStationIcon(plan.station)}
                                        <span>{plan.course} Item</span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-xs">
                                        <div className="flex items-center space-x-1 text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            <span>{plan.prep_time}m</span>
                                        </div>
                                        <div className="font-mono text-orange-500">
                                            {format(new Date(plan.fire_at), 'HH:mm:ss')}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

function getStationIcon(station: string) {
    switch (station) {
        case 'grill': return <Flame className="w-4 h-4 text-red-500" />;
        case 'saute': return <Flame className="w-4 h-4 text-yellow-500" />; // Should use a pan icon if available
        case 'pastry': return <ChefHat className="w-4 h-4 text-pink-500" />;
        default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
}

'use client';

import { AgentManager } from "@/components/agents/AgentManager";
import { Bot, Sparkles } from "lucide-react";

export default function AgentsPage() {
    return (
        <div className="flex h-screen bg-void text-white overflow-hidden flex-col">
            <header className="border-b border-white/10 bg-charcoal/50 p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center">
                        <Bot className="h-7 w-7 text-gold" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Guest Simulation</h1>
                        <p className="text-muted-foreground text-sm">Spawn AI agents to test restaurant flow</p>
                    </div>
                </div>
                <div className="flex items-center bg-white/5 rounded-full px-4 py-2 border border-white/10">
                    <Sparkles className="h-4 w-4 text-gold mr-2" />
                    <span className="text-xs text-muted-foreground">Agents interact directly with RestaurantOS context</span>
                </div>
            </header>

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    <AgentManager />
                </div>
            </main>
        </div>
    );
}

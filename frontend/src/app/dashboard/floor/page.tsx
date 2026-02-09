"use client";

import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { FloorPlanView } from "@/components/dashboard/FloorPlanView";

function FloorPlanLoader() {
    return (
        <div className="h-[600px] bg-charcoal/50 rounded-xl flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading floor plan...</div>
        </div>
    );
}

export default function FloorPage() {
    return (
        <div className="flex min-h-screen bg-void">
            <Sidebar />

            <main className="flex-1 ml-20 p-8">
                {/* Header */}
                <header className="mb-8 flex items-center justify-between animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Floor Plan</h1>
                        <p className="text-muted-foreground">Real-time table status and seating</p>
                    </div>
                </header>

                {/* Floor Plan */}
                <Card className="glass-card-elevated">
                    <CardHeader className="border-b border-white/5">
                        <CardTitle>Main Dining Room</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <Suspense fallback={<FloorPlanLoader />}>
                            <FloorPlanView />
                        </Suspense>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

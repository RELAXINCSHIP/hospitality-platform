'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
    {
        average: 400,
        today: 240,
    },
    {
        average: 300,
        today: 139,
    },
    {
        average: 200,
        today: 980,
    },
    {
        average: 278,
        today: 390,
    },
    {
        average: 189,
        today: 480,
    },
    {
        average: 239,
        today: 380,
    },
    {
        average: 349,
        today: 430,
    },
]

export function RevenueChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#888888"
                    strokeWidth={2}
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="today"
                    stroke="currentColor"
                    strokeWidth={2}
                    dot={false}
                    className="stroke-primary"
                />
            </LineChart>
        </ResponsiveContainer>
    )
}

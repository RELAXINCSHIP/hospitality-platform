"use client";

import { cn } from "@/lib/utils";

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: "gold" | "emerald" | "ruby" | "sapphire";
    className?: string;
}

const colorClasses = {
    gold: "stroke-gold",
    emerald: "stroke-emerald",
    ruby: "stroke-ruby",
    sapphire: "stroke-sapphire",
};

export function Sparkline({
    data,
    width = 80,
    height = 24,
    color = "gold",
    className
}: SparklineProps) {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(" ");

    const isPositive = data[data.length - 1] >= data[0];

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className={cn("overflow-visible", className)}
            style={{ width, height }}
        >
            <polyline
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                className={cn(
                    colorClasses[color],
                    isPositive ? "opacity-100" : "opacity-60"
                )}
            />
            {/* End dot */}
            <circle
                cx={(data.length - 1) / (data.length - 1) * width}
                cy={height - ((data[data.length - 1] - min) / range) * height}
                r="2"
                className={cn("fill-current", colorClasses[color].replace("stroke", "text"))}
            />
        </svg>
    );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
};

export function Avatar({
    src,
    alt,
    fallback,
    size = "md",
    className,
    ...props
}: AvatarProps) {
    const [hasError, setHasError] = React.useState(false);

    const initials = fallback || alt?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

    return (
        <div
            className={cn(
                "relative flex shrink-0 overflow-hidden rounded-full bg-charcoal border border-white/10",
                sizeClasses[size],
                className
            )}
            {...props}
        >
            {src && !hasError ? (
                <img
                    src={src}
                    alt={alt || "Avatar"}
                    className="aspect-square h-full w-full object-cover"
                    onError={() => setHasError(true)}
                />
            ) : (
                <span className="flex h-full w-full items-center justify-center font-semibold text-muted-foreground">
                    {initials}
                </span>
            )}
        </div>
    );
}

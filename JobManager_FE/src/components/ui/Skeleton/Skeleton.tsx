import React from "react";
import clsx from "clsx";

interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular";
    width?: string | number;
    height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className,
    variant = "text",
    width,
    height,
}) => {
    return (
        <div
            className={clsx(
                "animate-pulse bg-gray-200 rounded",
                variant === "circular" && "rounded-full",
                className
            )}
            style={{ width, height }}
        />
    );
};

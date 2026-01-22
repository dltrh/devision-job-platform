import React from "react";
import clsx from "clsx";

interface NotificationSkeletonProps {
    count?: number;
    className?: string;
}

export const NotificationSkeleton: React.FC<NotificationSkeletonProps> = ({
    count = 3,
    className,
}) => {
    return (
        <div className={clsx("space-y-2", className)}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex gap-3 p-3 rounded-lg animate-pulse">
                    {/* Icon skeleton */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200" />

                    {/* Content skeleton */}
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-32 bg-gray-200 rounded" />
                            <div className="h-3 w-12 bg-gray-200 rounded" />
                        </div>
                        <div className="h-3 w-full bg-gray-200 rounded" />
                        <div className="h-3 w-3/4 bg-gray-200 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
};

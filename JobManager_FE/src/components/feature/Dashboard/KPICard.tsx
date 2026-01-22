import React from "react";
import { Card } from "../../ui/Card/Card";
import { Skeleton } from "../../ui/Skeleton/Skeleton";
import clsx from "clsx";

interface KPICardProps {
    title: string;
    value: string | number;
    subValue?: string;
    icon?: React.ReactNode;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    onClick?: () => void;
    active?: boolean;
    isLoading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    subValue,
    icon,
    trend,
    trendValue,
    onClick,
    active = false,
    isLoading = false,
}) => {
    return (
        <Card
            className={clsx(
                "flex flex-col justify-between h-full transition-all duration-200",
                active
                    ? "ring-2 ring-blue-500 border-blue-500"
                    : "hover:border-gray-300"
            )}
            hover={!!onClick && !isLoading}
            padding="lg"
        >
            <div
                onClick={!isLoading ? onClick : undefined}
                className={clsx(onClick && !isLoading && "cursor-pointer")}
            >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        {title}
                    </h3>
                    {icon && <div className="text-gray-400">{icon}</div>}
                </div>

                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton height={36} width="60%" />
                        <Skeleton height={16} width="40%" />
                    </div>
                ) : (
                    <>
                        <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-gray-900">
                                {value}
                            </span>
                            {subValue && (
                                <span className="ml-2 text-sm text-gray-500">
                                    {subValue}
                                </span>
                            )}
                        </div>
                        {trendValue && (
                            <div className="mt-2 flex items-center text-sm">
                                <span
                                    className={clsx(
                                        "font-medium",
                                        trend === "up"
                                            ? "text-green-600"
                                            : trend === "down"
                                              ? "text-red-600"
                                              : "text-gray-500"
                                    )}
                                >
                                    {trend === "up"
                                        ? "↑"
                                        : trend === "down"
                                          ? "↓"
                                          : "•"}{" "}
                                    {trendValue}
                                </span>
                                <span className="text-gray-400 ml-1">
                                    vs last month
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
};

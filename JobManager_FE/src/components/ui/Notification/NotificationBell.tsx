import React from "react";
import clsx from "clsx";
import { HeadlessNotificationBadge } from "@/components/headless/Notification";

interface NotificationBellProps {
    count: number;
    onClick?: () => void;
    className?: string;
    "aria-label"?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
    count,
    onClick,
    className,
    "aria-label": ariaLabel = "Notifications",
}) => {
    return (
        <HeadlessNotificationBadge count={count} maxCount={99}>
            {({ displayCount, hasNotifications }) => (
                <button
                    type="button"
                    onClick={onClick}
                    className={clsx(
                        "relative p-2 rounded-full transition-all duration-200",
                        "text-gray-600 hover:text-blue-600 hover:bg-blue-50",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                        className
                    )}
                    aria-label={ariaLabel}
                    aria-haspopup="true"
                >
                    {/* Bell Icon */}
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>

                    {/* Badge */}
                    {hasNotifications && (
                        <span
                            className={clsx(
                                "absolute -top-0.5 -right-0.5 flex items-center justify-center",
                                "min-w-[18px] h-[18px] px-1",
                                "text-[10px] font-bold text-white",
                                "bg-red-500 rounded-full",
                                "animate-pulse",
                                "ring-2 ring-white"
                            )}
                        >
                            {displayCount}
                        </span>
                    )}
                </button>
            )}
        </HeadlessNotificationBadge>
    );
};

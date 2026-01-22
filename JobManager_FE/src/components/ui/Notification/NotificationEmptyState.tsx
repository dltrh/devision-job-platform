import React from "react";
import clsx from "clsx";

interface NotificationEmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export const NotificationEmptyState: React.FC<NotificationEmptyStateProps> = ({
    title = "No notifications",
    description = "You're all caught up! We'll notify you when something new happens.",
    icon,
    action,
    className,
}) => {
    return (
        <div
            className={clsx(
                "flex flex-col items-center justify-center py-12 px-4 text-center",
                className
            )}
        >
            {icon || (
                <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>
                </div>
            )}

            <h3 className="text-base font-medium text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 max-w-xs">{description}</p>

            {action && (
                <button
                    type="button"
                    onClick={action.onClick}
                    className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

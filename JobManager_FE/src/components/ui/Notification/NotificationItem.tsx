import React from "react";
import clsx from "clsx";
import { Notification } from "@/types/notification";
import { HeadlessNotificationItem } from "@/components/headless/Notification";

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead?: () => void;
    onDelete?: () => void;
    onClick?: () => void;
    compact?: boolean;
    className?: string;
}

const typeColorClasses: Record<string, { bg: string; text: string; dot: string }> = {
    purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        dot: "bg-purple-500",
    },
    blue: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        dot: "bg-blue-500",
    },
    yellow: {
        bg: "bg-yellow-50",
        text: "text-yellow-600",
        dot: "bg-yellow-500",
    },
    red: {
        bg: "bg-red-50",
        text: "text-red-600",
        dot: "bg-red-500",
    },
    gray: {
        bg: "bg-gray-50",
        text: "text-gray-600",
        dot: "bg-gray-500",
    },
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onMarkAsRead,
    onDelete,
    onClick,
    compact = false,
    className,
}) => {
    return (
        <HeadlessNotificationItem
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
            onClick={onClick}
        >
            {({
                isUnread,
                typeIcon,
                typeColor,
                relativeTime,
                handleClick,
                markAsRead,
                deleteItem,
                hasAction,
                actionLabel,
                contextSummary,
            }) => {
                const colors = typeColorClasses[typeColor] || typeColorClasses.gray;

                return (
                    <div
                        className={clsx(
                            "group relative flex gap-3 p-3 rounded-lg transition-all duration-200",
                            "hover:bg-gray-50 cursor-pointer",
                            isUnread && "bg-blue-50/50",
                            className
                        )}
                        onClick={handleClick}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleClick();
                            }
                        }}
                        aria-label={`${notification.title}. ${contextSummary}. ${relativeTime}`}
                    >
                        {/* Unread indicator */}
                        {isUnread && (
                            <span
                                className={clsx(
                                    "absolute left-1 top-1/2 -translate-y-1/2",
                                    "w-2 h-2 rounded-full",
                                    colors.dot
                                )}
                                aria-hidden="true"
                            />
                        )}

                        {/* Icon */}
                        <div
                            className={clsx(
                                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                                colors.bg
                            )}
                        >
                            <span className="text-lg" role="img" aria-hidden="true">
                                {typeIcon}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <h4
                                    className={clsx(
                                        "text-sm font-medium text-gray-900 truncate",
                                        isUnread && "font-semibold"
                                    )}
                                >
                                    {notification.title}
                                </h4>
                                <span className="flex-shrink-0 text-xs text-gray-500">
                                    {relativeTime}
                                </span>
                            </div>

                            <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">
                                {contextSummary}
                            </p>

                            {/* Actions - visible on hover */}
                            {!compact && (
                                <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {hasAction && (
                                        <button
                                            type="button"
                                            className={clsx(
                                                "text-xs font-medium px-2 py-1 rounded",
                                                colors.text,
                                                colors.bg,
                                                "hover:opacity-80 transition-opacity"
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleClick();
                                            }}
                                        >
                                            {actionLabel}
                                        </button>
                                    )}

                                    {isUnread && (
                                        <button
                                            type="button"
                                            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead();
                                            }}
                                        >
                                            Mark as read
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 ml-auto"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteItem();
                                        }}
                                        aria-label="Delete notification"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            }}
        </HeadlessNotificationItem>
    );
};

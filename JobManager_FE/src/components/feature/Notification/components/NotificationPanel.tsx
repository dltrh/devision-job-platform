import React from "react";
import clsx from "clsx";
import { Notification } from "@/types/notification";
import { HeadlessNotificationPanel } from "@/components/headless/Notification";
import {
    NotificationItem,
    NotificationEmptyState,
    NotificationSkeleton,
    PremiumUpgradeCard,
} from "@/components/ui/Notification";

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    loading?: boolean;
    unreadCount?: number;
    isPremium?: boolean;
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onViewAll?: () => void;
    onNotificationClick?: (notification: Notification) => void;
    onUpgradeClick?: () => void;
    position?: "left" | "right";
    className?: string;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
    isOpen,
    onClose,
    notifications,
    loading = false,
    unreadCount = 0,
    isPremium = false,
    onMarkAsRead,
    onMarkAllAsRead,
    onViewAll,
    onNotificationClick,
    onUpgradeClick,
    position = "right",
    className,
}) => {
    return (
        <HeadlessNotificationPanel
            isOpen={isOpen}
            onClose={onClose}
            notifications={notifications}
            loading={loading}
            unreadCount={unreadCount}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onViewAll={onViewAll}
            onNotificationClick={onNotificationClick}
            closeOnOutsideClick
            closeOnEscape
        >
            {({
                panelRef,
                close,
                isEmpty,
                hasUnread,
                markAsRead,
                markAllAsRead,
                viewAll,
                handleNotificationClick,
            }) => (
                <div
                    ref={panelRef}
                    className={clsx(
                        "absolute top-full mt-2 z-50",
                        "w-96 max-h-[32rem]",
                        "bg-white rounded-xl shadow-xl border border-gray-200",
                        "flex flex-col overflow-hidden",
                        "animate-in fade-in slide-in-from-top-2 duration-200",
                        position === "right" ? "right-0" : "left-0",
                        className
                    )}
                    role="dialog"
                    aria-label="Notifications"
                    tabIndex={-1}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
                            {hasUnread && (
                                <span className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {hasUnread && (
                                <button
                                    type="button"
                                    onClick={markAllAsRead}
                                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                                >
                                    Mark all as read
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={close}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                aria-label="Close notifications"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Premium upgrade card for non-premium users */}
                        {!isPremium && (
                            <div className="p-3 border-b border-gray-100">
                                <PremiumUpgradeCard
                                    title="Get Real-Time Alerts"
                                    description="Receive instant notifications when top talent matches your job posts."
                                    buttonLabel="Upgrade Now"
                                    onUpgradeClick={onUpgradeClick}
                                />
                            </div>
                        )}

                        {loading ? (
                            <div className="p-3">
                                <NotificationSkeleton count={4} />
                            </div>
                        ) : isEmpty ? (
                            <NotificationEmptyState />
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.slice(0, 10).map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        compact
                                        onMarkAsRead={() => markAsRead(notification.id)}
                                        onClick={() => handleNotificationClick(notification)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 px-4 py-3">
                        <button
                            type="button"
                            onClick={viewAll}
                            className={clsx(
                                "w-full py-2 text-sm font-medium text-center",
                                "text-blue-600 hover:text-blue-700",
                                "rounded-lg hover:bg-blue-50 transition-colors"
                            )}
                        >
                            View all notifications
                        </button>
                    </div>
                </div>
            )}
        </HeadlessNotificationPanel>
    );
};

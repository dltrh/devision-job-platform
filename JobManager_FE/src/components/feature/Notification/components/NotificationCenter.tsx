import React, { useState, useMemo } from "react";
import clsx from "clsx";
import { Notification, NotificationFilters } from "@/types/notification";
import {
    HeadlessNotificationList,
    HeadlessNotificationTabs,
    NotificationTab,
} from "@/components/headless/Notification";
import {
    NotificationItem,
    NotificationEmptyState,
    NotificationSkeleton,
} from "@/components/ui/Notification";

interface NotificationCenterProps {
    notifications: Notification[];
    loading?: boolean;
    error?: string | null;
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onDelete?: (id: string) => void;
    onNotificationClick?: (notification: Notification) => void;
    onRefresh?: () => void;
    className?: string;
}

type TabId = "all" | "unread" | "matches" | "applications" | "system";

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
    notifications,
    loading = false,
    error = null,
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete,
    onNotificationClick,
    onRefresh,
    className,
}) => {
    const [activeTab, setActiveTab] = useState<TabId>("all");
    const [filters, setFilters] = useState<NotificationFilters>({
        type: "all",
        status: "all",
    });

    // Calculate tab counts
    const tabCounts = useMemo(() => {
        const unread = notifications.filter((n) => n.status === "unread").length;
        const matches = notifications.filter((n) => n.type === "MATCH_ALERT").length;
        const applications = notifications.filter((n) => n.type === "APPLICATION_RECEIVED").length;
        const system = notifications.filter(
            (n) =>
                n.type === "SYSTEM_ALERT" ||
                n.type === "SUBSCRIPTION_WARNING" ||
                n.type === "SUBSCRIPTION_EXPIRED"
        ).length;

        return {
            all: notifications.length,
            unread,
            matches,
            applications,
            system,
        };
    }, [notifications]);

    const tabs: NotificationTab[] = [
        { id: "all", label: "All", count: tabCounts.all },
        { id: "unread", label: "Unread", count: tabCounts.unread },
        { id: "matches", label: "Matches", count: tabCounts.matches, icon: "🔔" },
        { id: "applications", label: "Applications", count: tabCounts.applications, icon: "📄" },
        { id: "system", label: "System", count: tabCounts.system, icon: "⚠️" },
    ];

    // Filter notifications based on active tab
    const filteredNotifications = useMemo(() => {
        switch (activeTab) {
            case "unread":
                return notifications.filter((n) => n.status === "unread");
            case "matches":
                return notifications.filter((n) => n.type === "MATCH_ALERT");
            case "applications":
                return notifications.filter((n) => n.type === "APPLICATION_RECEIVED");
            case "system":
                return notifications.filter(
                    (n) =>
                        n.type === "SYSTEM_ALERT" ||
                        n.type === "SUBSCRIPTION_WARNING" ||
                        n.type === "SUBSCRIPTION_EXPIRED"
                );
            default:
                return notifications;
        }
    }, [notifications, activeTab]);

    return (
        <div className={clsx("bg-white rounded-xl shadow-sm border border-gray-200", className)}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Notification Center</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Stay updated with your job posts and applicants
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {onRefresh && (
                            <button
                                type="button"
                                onClick={onRefresh}
                                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                                aria-label="Refresh notifications"
                            >
                                <svg
                                    className={clsx("w-5 h-5", loading && "animate-spin")}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                            </button>
                        )}
                        {tabCounts.unread > 0 && onMarkAllAsRead && (
                            <button
                                type="button"
                                onClick={onMarkAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <HeadlessNotificationTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={(tabId) => setActiveTab(tabId as TabId)}
                >
                    {({ tabs: tabList, isActive, setActiveTab: switchTab }) => (
                        <div className="flex items-center gap-1 overflow-x-auto pb-1">
                            {tabList.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => switchTab(tab.id)}
                                    className={clsx(
                                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                                        isActive(tab.id)
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-gray-600 hover:bg-gray-100"
                                    )}
                                >
                                    {tab.icon && <span>{tab.icon}</span>}
                                    {tab.label}
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span
                                            className={clsx(
                                                "px-1.5 py-0.5 text-xs rounded-full",
                                                isActive(tab.id)
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-gray-100 text-gray-600"
                                            )}
                                        >
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </HeadlessNotificationTabs>
            </div>

            {/* Content */}
            <HeadlessNotificationList
                notifications={filteredNotifications}
                loading={loading}
                error={error}
                filters={filters}
                onMarkAsRead={onMarkAsRead}
                onMarkAllAsRead={onMarkAllAsRead}
                onDelete={onDelete}
                onFilterChange={setFilters}
                onNotificationClick={onNotificationClick}
            >
                {({ notifications: items, isEmpty, loading: isLoading, error: errorMsg }) => (
                    <div className="min-h-[400px]">
                        {isLoading ? (
                            <div className="p-4">
                                <NotificationSkeleton count={5} />
                            </div>
                        ) : errorMsg ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4">
                                <div className="w-12 h-12 mb-4 rounded-full bg-red-50 flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-red-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-500">{errorMsg}</p>
                                {onRefresh && (
                                    <button
                                        type="button"
                                        onClick={onRefresh}
                                        className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Try again
                                    </button>
                                )}
                            </div>
                        ) : isEmpty ? (
                            <NotificationEmptyState
                                title={
                                    activeTab === "unread"
                                        ? "All caught up!"
                                        : `No ${activeTab === "all" ? "" : activeTab} notifications`
                                }
                                description={
                                    activeTab === "unread"
                                        ? "You have no unread notifications."
                                        : "New notifications will appear here."
                                }
                            />
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {items.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onMarkAsRead={() => onMarkAsRead?.(notification.id)}
                                        onDelete={() => onDelete?.(notification.id)}
                                        onClick={() => onNotificationClick?.(notification)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </HeadlessNotificationList>
        </div>
    );
};

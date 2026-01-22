import { useMemo, useCallback } from "react";
import {
    Notification,
    NotificationFilters,
    NotificationStatus,
    NotificationType,
} from "@/types/notification";
import {
    HeadlessNotificationListProps,
    NotificationListRenderProps,
} from "./types";

export const HeadlessNotificationList: React.FC<
    HeadlessNotificationListProps
> = ({
    notifications,
    loading = false,
    error = null,
    filters = { type: "all", status: "all" },
    pagination,
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete,
    onFilterChange,
    onPageChange,
    onNotificationClick,
    children,
}) => {
    // Separate unread and read notifications
    const unreadNotifications = useMemo(
        () => notifications.filter((n) => n.status === "unread"),
        [notifications]
    );

    const readNotifications = useMemo(
        () => notifications.filter((n) => n.status === "read"),
        [notifications]
    );

    // Group notifications by type
    const groupedNotifications = useMemo(() => {
        return notifications.reduce(
            (acc, notification) => {
                const type = notification.type;
                if (!acc[type]) {
                    acc[type] = [];
                }
                acc[type].push(notification);
                return acc;
            },
            {} as Record<NotificationType, Notification[]>
        );
    }, [notifications]);

    // Action handlers
    const markAsRead = useCallback(
        (id: string) => {
            onMarkAsRead?.(id);
        },
        [onMarkAsRead]
    );

    const markAllAsRead = useCallback(() => {
        onMarkAllAsRead?.();
    }, [onMarkAllAsRead]);

    const deleteNotification = useCallback(
        (id: string) => {
            onDelete?.(id);
        },
        [onDelete]
    );

    const setFilter = useCallback(
        (newFilters: Partial<NotificationFilters>) => {
            onFilterChange?.({ ...filters, ...newFilters });
        },
        [filters, onFilterChange]
    );

    const goToPage = useCallback(
        (page: number) => {
            onPageChange?.(page);
        },
        [onPageChange]
    );

    const handleNotificationClick = useCallback(
        (notification: Notification) => {
            onNotificationClick?.(notification);
        },
        [onNotificationClick]
    );

    // Helper functions
    const getNotificationById = useCallback(
        (id: string) => {
            return notifications.find((n) => n.id === id);
        },
        [notifications]
    );

    const filterByType = useCallback(
        (type: NotificationType) => {
            return notifications.filter((n) => n.type === type);
        },
        [notifications]
    );

    const filterByStatus = useCallback(
        (status: NotificationStatus) => {
            return notifications.filter((n) => n.status === status);
        },
        [notifications]
    );

    const renderProps: NotificationListRenderProps = {
        notifications,
        unreadNotifications,
        readNotifications,
        groupedNotifications,
        loading,
        error,
        isEmpty: notifications.length === 0,
        hasUnread: unreadNotifications.length > 0,
        unreadCount: unreadNotifications.length,
        filters,
        pagination: pagination ?? null,
        // Actions
        markAsRead,
        markAllAsRead,
        deleteNotification,
        setFilter,
        goToPage,
        handleNotificationClick,
        // Helpers
        getNotificationById,
        filterByType,
        filterByStatus,
    };

    return <>{children(renderProps)}</>;
};

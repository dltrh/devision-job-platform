import { useState, useEffect, useCallback, useRef } from "react";
import {
    Notification,
    NotificationFilters,
    NotificationPagination,
    NotificationsResponse,
} from "@/types/notification";
import { notificationService } from "../api/notificationService";

interface UseNotificationsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
    initialFilters?: NotificationFilters;
    pageSize?: number;
}

interface UseNotificationsReturn {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    pagination: NotificationPagination | null;
    filters: NotificationFilters;
    // Actions
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    setFilters: (filters: Partial<NotificationFilters>) => void;
    setPage: (page: number) => void;
    refresh: () => Promise<void>;
}

export const useNotifications = (options: UseNotificationsOptions = {}): UseNotificationsReturn => {
    const {
        autoRefresh = true,
        refreshInterval = 30000, // 30 seconds
        initialFilters = { type: "all", status: "all" },
        pageSize = 20,
    } = options;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<NotificationPagination | null>(null);
    const [filters, setFiltersState] = useState<NotificationFilters>(initialFilters);
    const [currentPage, setCurrentPage] = useState(1);

    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response: NotificationsResponse = await notificationService.getNotifications({
                ...filters,
                page: currentPage,
                pageSize,
            });

            setNotifications(response.notifications);
            setUnreadCount(response.unreadCount);
            setPagination(response.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    }, [filters, currentPage, pageSize]);

    const markAsRead = useCallback(async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id
                        ? { ...n, status: "read" as const, readAt: new Date().toISOString() }
                        : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({
                    ...n,
                    status: "read" as const,
                    readAt: new Date().toISOString(),
                }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all notifications as read:", err);
        }
    }, []);

    const deleteNotification = useCallback(
        async (id: string) => {
            try {
                await notificationService.deleteNotification(id);
                setNotifications((prev) => prev.filter((n) => n.id !== id));
                // Update unread count if deleted notification was unread
                const deletedNotification = notifications.find((n) => n.id === id);
                if (deletedNotification?.status === "unread") {
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                }
            } catch (err) {
                console.error("Failed to delete notification:", err);
            }
        },
        [notifications]
    );

    const setFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
        setFiltersState((prev) => ({ ...prev, ...newFilters }));
        setCurrentPage(1); // Reset to first page when filters change
    }, []);

    const setPage = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const refresh = useCallback(async () => {
        await fetchNotifications();
    }, [fetchNotifications]);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Auto-refresh
    useEffect(() => {
        if (autoRefresh && refreshInterval > 0) {
            refreshIntervalRef.current = setInterval(() => {
                fetchNotifications();
            }, refreshInterval);

            return () => {
                if (refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                }
            };
        }
    }, [autoRefresh, refreshInterval, fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        pagination,
        filters,
        // Actions
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        setFilters,
        setPage,
        refresh,
    };
};

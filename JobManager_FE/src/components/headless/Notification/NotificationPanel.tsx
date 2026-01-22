import { useEffect, useRef, useCallback, useMemo } from "react";
import { Notification } from "@/types/notification";
import {
    HeadlessNotificationPanelProps,
    NotificationPanelRenderProps,
} from "./types";

export const HeadlessNotificationPanel: React.FC<
    HeadlessNotificationPanelProps
> = ({
    isOpen,
    onClose,
    notifications,
    loading = false,
    unreadCount = 0,
    onMarkAsRead,
    onMarkAllAsRead,
    onViewAll,
    onNotificationClick,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    children,
}) => {
    const panelRef = useRef<HTMLDivElement>(null);

    // Handle escape key
    useEffect(() => {
        if (!closeOnEscape || !isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose, closeOnEscape]);

    // Handle outside click
    useEffect(() => {
        if (!closeOnOutsideClick || !isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        // Delay adding the listener to prevent immediate close
        const timeoutId = setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose, closeOnOutsideClick]);

    // Focus management for accessibility
    useEffect(() => {
        if (isOpen && panelRef.current) {
            panelRef.current.focus();
        }
    }, [isOpen]);

    const close = useCallback(() => {
        onClose();
    }, [onClose]);

    const markAsRead = useCallback(
        (id: string) => {
            onMarkAsRead?.(id);
        },
        [onMarkAsRead]
    );

    const markAllAsRead = useCallback(() => {
        onMarkAllAsRead?.();
    }, [onMarkAllAsRead]);

    const viewAll = useCallback(() => {
        onViewAll?.();
        onClose();
    }, [onViewAll, onClose]);

    const handleNotificationClick = useCallback(
        (notification: Notification) => {
            onNotificationClick?.(notification);
        },
        [onNotificationClick]
    );

    const computedUnreadCount = useMemo(() => {
        return (
            unreadCount ||
            notifications.filter((n) => n.status === "unread").length
        );
    }, [unreadCount, notifications]);

    const renderProps: NotificationPanelRenderProps = {
        isOpen,
        close,
        notifications,
        loading,
        isEmpty: notifications.length === 0,
        unreadCount: computedUnreadCount,
        hasUnread: computedUnreadCount > 0,
        // Actions
        markAsRead,
        markAllAsRead,
        viewAll,
        handleNotificationClick,
        // Refs
        panelRef: panelRef as React.RefObject<HTMLDivElement>,
    };

    if (!isOpen) return null;

    return <>{children(renderProps)}</>;
};

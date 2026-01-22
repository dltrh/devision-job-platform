import { useMemo, useCallback } from "react";
import {
    Notification,
    getNotificationCategory,
    NotificationType,
} from "@/types/notification";
import {
    HeadlessNotificationItemProps,
    NotificationItemRenderProps,
} from "./types";

// Helper function to format relative time
const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return "Just now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays}d ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks}w ago`;
    }

    return date.toLocaleDateString();
};

// Helper function to format timestamp
const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
};

// Generate context summary based on notification type
const generateContextSummary = (notification: Notification): string => {
    const { type, metadata } = notification;

    switch (type) {
        case "MATCH_ALERT": {
            const parts: string[] = [];
            if (metadata.matchedSkills?.length) {
                parts.push(
                    `Skills: ${metadata.matchedSkills.slice(0, 3).join(", ")}`
                );
            }
            if (metadata.location) {
                parts.push(metadata.location);
            }
            if (metadata.salaryExpectation) {
                parts.push(metadata.salaryExpectation);
            }
            return parts.join(" • ") || notification.message;
        }

        case "APPLICATION_RECEIVED": {
            const parts: string[] = [];
            if (metadata.jobPostTitle) {
                parts.push(`Job: ${metadata.jobPostTitle}`);
            }
            if (metadata.applicantName) {
                parts.push(`From: ${metadata.applicantName}`);
            }
            return parts.join(" • ") || notification.message;
        }

        case "SUBSCRIPTION_WARNING": {
            if (metadata.daysRemaining !== undefined) {
                return `${metadata.daysRemaining} days remaining on ${metadata.subscriptionPlan || "your plan"}`;
            }
            return notification.message;
        }

        case "SUBSCRIPTION_EXPIRED": {
            return (
                metadata.subscriptionPlan
                    ? `${metadata.subscriptionPlan} plan has expired`
                    : notification.message
            );
        }

        case "SYSTEM_ALERT":
        default:
            return notification.message;
    }
};

// Get default action label based on notification type
const getDefaultActionLabel = (type: NotificationType): string => {
    switch (type) {
        case "MATCH_ALERT":
            return "View Applicant";
        case "APPLICATION_RECEIVED":
            return "View Application";
        case "SUBSCRIPTION_WARNING":
        case "SUBSCRIPTION_EXPIRED":
            return "View Plans";
        case "SYSTEM_ALERT":
            return "Learn More";
        default:
            return "View";
    }
};

export const HeadlessNotificationItem: React.FC<
    HeadlessNotificationItemProps
> = ({ notification, onMarkAsRead, onDelete, onClick, children }) => {
    const category = useMemo(
        () => getNotificationCategory(notification.type),
        [notification.type]
    );

    const isUnread = notification.status === "unread";
    const relativeTime = useMemo(
        () => formatRelativeTime(notification.createdAt),
        [notification.createdAt]
    );
    const formattedTime = useMemo(
        () => formatTimestamp(notification.createdAt),
        [notification.createdAt]
    );
    const contextSummary = useMemo(
        () => generateContextSummary(notification),
        [notification]
    );

    const markAsRead = useCallback(() => {
        if (isUnread) {
            onMarkAsRead?.();
        }
    }, [isUnread, onMarkAsRead]);

    const deleteItem = useCallback(() => {
        onDelete?.();
    }, [onDelete]);

    const handleClick = useCallback(() => {
        // Auto-mark as read on click
        if (isUnread) {
            onMarkAsRead?.();
        }
        onClick?.();
    }, [isUnread, onMarkAsRead, onClick]);

    const renderProps: NotificationItemRenderProps = {
        notification,
        isUnread,
        typeLabel: category?.label || "Notification",
        typeIcon: category?.icon || "🔔",
        typeColor: category?.color || "gray",
        formattedTime,
        relativeTime,
        // Actions
        markAsRead,
        deleteItem,
        handleClick,
        // Computed
        hasAction: !!notification.actionUrl,
        actionUrl: notification.actionUrl,
        actionLabel:
            notification.actionLabel ||
            getDefaultActionLabel(notification.type),
        contextSummary,
    };

    return <>{children(renderProps)}</>;
};

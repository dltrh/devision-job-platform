// Notification Types

export type NotificationType =
    | "MATCH_ALERT" // Real-time match notifications (Premium only)
    | "APPLICATION_RECEIVED" // New applicant applied to job post
    | "SUBSCRIPTION_WARNING" // 7-day warning before expiration
    | "SUBSCRIPTION_EXPIRED" // Subscription expired
    | "SYSTEM_ALERT"; // System alerts (optional, low frequency)

export type NotificationPriority = "high" | "medium" | "low";

export type NotificationStatus = "unread" | "read";

export interface NotificationMetadata {
    // For MATCH_ALERT
    matchedSkills?: string[];
    matchScore?: number;
    applicantId?: string;
    applicantName?: string;
    location?: string;
    salaryExpectation?: string;

    // For APPLICATION_RECEIVED
    jobPostId?: string;
    jobPostTitle?: string;
    applicationId?: string;

    // For SUBSCRIPTION notifications
    daysRemaining?: number;
    subscriptionPlan?: string;
    expirationDate?: string;

    // For SYSTEM_ALERT
    alertCode?: string;
    severity?: "info" | "warning" | "error";
}

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    status: NotificationStatus;
    priority: NotificationPriority;
    metadata: NotificationMetadata;
    actionUrl?: string;
    actionLabel?: string;
    createdAt: string;
    readAt?: string;
}

export interface NotificationPreferences {
    matchAlerts: boolean;
    applicationAlerts: boolean;
    subscriptionAlerts: boolean;
    systemAlerts: boolean;
    emailNotifications: boolean;
}

export interface NotificationFilters {
    type?: NotificationType | "all";
    status?: NotificationStatus | "all";
    search?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface NotificationPagination {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface NotificationsResponse {
    notifications: Notification[];
    pagination: NotificationPagination;
    unreadCount: number;
}

// Notification category for UI grouping
export interface NotificationCategory {
    type: NotificationType;
    label: string;
    icon: string;
    color: string;
    description: string;
}

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
    {
        type: "MATCH_ALERT",
        label: "Talent Matches",
        icon: "🔔",
        color: "purple",
        description: "Real-time matching applicants (Premium)",
    },
    {
        type: "APPLICATION_RECEIVED",
        label: "Applications",
        icon: "📄",
        color: "blue",
        description: "New applications to your job posts",
    },
    {
        type: "SUBSCRIPTION_WARNING",
        label: "Subscription",
        icon: "🧾",
        color: "yellow",
        description: "Subscription status updates",
    },
    {
        type: "SUBSCRIPTION_EXPIRED",
        label: "Subscription",
        icon: "🧾",
        color: "red",
        description: "Subscription expired",
    },
    {
        type: "SYSTEM_ALERT",
        label: "System",
        icon: "⚠️",
        color: "gray",
        description: "System notifications",
    },
];

// Helper to get category by type
export const getNotificationCategory = (
    type: NotificationType
): NotificationCategory | undefined => {
    return NOTIFICATION_CATEGORIES.find((cat) => cat.type === type);
};

import {
    Notification,
    NotificationFilters,
    NotificationPagination,
    NotificationStatus,
    NotificationType,
} from "@/types/notification";

// Headless Notification List Props
export interface HeadlessNotificationListProps {
    notifications: Notification[];
    loading?: boolean;
    error?: string | null;
    filters?: NotificationFilters;
    pagination?: NotificationPagination;
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onDelete?: (id: string) => void;
    onFilterChange?: (filters: NotificationFilters) => void;
    onPageChange?: (page: number) => void;
    onNotificationClick?: (notification: Notification) => void;
    children: (props: NotificationListRenderProps) => React.ReactNode;
}

export interface NotificationListRenderProps {
    notifications: Notification[];
    unreadNotifications: Notification[];
    readNotifications: Notification[];
    groupedNotifications: Record<NotificationType, Notification[]>;
    loading: boolean;
    error: string | null;
    isEmpty: boolean;
    hasUnread: boolean;
    unreadCount: number;
    filters: NotificationFilters;
    pagination: NotificationPagination | null;
    // Actions
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    setFilter: (filters: Partial<NotificationFilters>) => void;
    goToPage: (page: number) => void;
    handleNotificationClick: (notification: Notification) => void;
    // Helpers
    getNotificationById: (id: string) => Notification | undefined;
    filterByType: (type: NotificationType) => Notification[];
    filterByStatus: (status: NotificationStatus) => Notification[];
}

// Headless Notification Item Props
export interface HeadlessNotificationItemProps {
    notification: Notification;
    onMarkAsRead?: () => void;
    onDelete?: () => void;
    onClick?: () => void;
    children: (props: NotificationItemRenderProps) => React.ReactNode;
}

export interface NotificationItemRenderProps {
    notification: Notification;
    isUnread: boolean;
    typeLabel: string;
    typeIcon: string;
    typeColor: string;
    formattedTime: string;
    relativeTime: string;
    // Actions
    markAsRead: () => void;
    deleteItem: () => void;
    handleClick: () => void;
    // Computed
    hasAction: boolean;
    actionUrl: string | undefined;
    actionLabel: string;
    contextSummary: string;
}

// Headless Notification Badge Props
export interface HeadlessNotificationBadgeProps {
    count: number;
    maxCount?: number;
    showZero?: boolean;
    children: (props: NotificationBadgeRenderProps) => React.ReactNode;
}

export interface NotificationBadgeRenderProps {
    count: number;
    displayCount: string;
    hasNotifications: boolean;
    isOverMax: boolean;
}

// Headless Notification Panel Props
export interface HeadlessNotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    loading?: boolean;
    unreadCount?: number;
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onViewAll?: () => void;
    onNotificationClick?: (notification: Notification) => void;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    children: (props: NotificationPanelRenderProps) => React.ReactNode;
}

export interface NotificationPanelRenderProps {
    isOpen: boolean;
    close: () => void;
    notifications: Notification[];
    loading: boolean;
    isEmpty: boolean;
    unreadCount: number;
    hasUnread: boolean;
    // Actions
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    viewAll: () => void;
    handleNotificationClick: (notification: Notification) => void;
    // Refs for positioning
    panelRef: React.RefObject<HTMLDivElement>;
}

// Headless Notification Tabs Props
export interface HeadlessNotificationTabsProps {
    tabs: NotificationTab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    children: (props: NotificationTabsRenderProps) => React.ReactNode;
}

export interface NotificationTab {
    id: string;
    label: string;
    count?: number;
    icon?: string;
}

export interface NotificationTabsRenderProps {
    tabs: NotificationTab[];
    activeTab: string;
    setActiveTab: (tabId: string) => void;
    isActive: (tabId: string) => boolean;
    getTabCount: (tabId: string) => number;
}

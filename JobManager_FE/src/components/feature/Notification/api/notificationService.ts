import httpClient from "@/services/httpClient";
import {
    Notification,
    NotificationFilters,
    NotificationsResponse,
    NotificationPreferences,
} from "@/types/notification";
import { getCompanyId } from "@/services/authStorage";

const NOTIFICATION_BASE_URL = "/notifications";

interface GetNotificationsParams extends NotificationFilters {
    page?: number;
    pageSize?: number;
}

// Helper to get user ID (using companyId as userId for now)
const getUserId = (): string => {
    const userId = getCompanyId();
    if (!userId) {
        throw new Error("User not authenticated");
    }
    return userId;
};

export const notificationService = {
    /**
     * Get notifications with optional filters and pagination
     */
    async getNotifications(params: GetNotificationsParams = {}): Promise<NotificationsResponse> {
        const userId = getUserId();
        const { page = 1, pageSize = 20, type, status, search, dateFrom, dateTo } = params;

        const queryParams = new URLSearchParams();
        // Backend uses 0-indexed pages
        queryParams.append("page", (page - 1).toString());
        queryParams.append("size", pageSize.toString());
        queryParams.append("sortBy", "createdAt");
        queryParams.append("sortDirection", "DESC");

        let endpoint = `${NOTIFICATION_BASE_URL}/user/${userId}`;

        // Use specific endpoints for type and status filters
        if (type && type !== "all") {
            endpoint = `${NOTIFICATION_BASE_URL}/user/${userId}/type/${type.toUpperCase()}`;
        } else if (status && status !== "all") {
            endpoint = `${NOTIFICATION_BASE_URL}/user/${userId}/status/${status.toUpperCase()}`;
        }

        const response = await httpClient.get<{
            data: {
                content: Notification[];
                totalElements: number;
                totalPages: number;
                number: number;
                size: number;
            };
        }>(`${endpoint}?${queryParams.toString()}`);

        // Transform backend Page response to frontend NotificationsResponse
        const pageData = response.data.data;
        const unreadCount = await this.getUnreadCount();

        return {
            notifications: pageData.content,
            unreadCount,
            pagination: {
                page: pageData.number + 1, // Convert back to 1-indexed
                totalPages: pageData.totalPages,
                pageSize: pageData.size,
                totalItems: pageData.totalElements,
            },
        };
    },

    /**
     * Get all notifications (non-paginated)
     */
    async getAllNotifications(): Promise<Notification[]> {
        const userId = getUserId();
        const response = await httpClient.get<{ data: Notification[] }>(
            `${NOTIFICATION_BASE_URL}/user/${userId}/all`
        );
        return response.data.data;
    },

    /**
     * Get a single notification by ID
     */
    async getNotification(id: string): Promise<Notification> {
        const response = await httpClient.get<{ data: Notification }>(
            `${NOTIFICATION_BASE_URL}/${id}`
        );
        return response.data.data;
    },

    /**
     * Get unread notification count from summary
     */
    async getUnreadCount(): Promise<number> {
        const userId = getUserId();
        const response = await httpClient.get<{ data: { unreadCount: number } }>(
            `${NOTIFICATION_BASE_URL}/user/${userId}/summary`
        );
        return response.data.data.unreadCount;
    },

    /**
     * Mark a notification as read
     */
    async markAsRead(id: string): Promise<void> {
        await httpClient.put(`${NOTIFICATION_BASE_URL}/${id}/read`);
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<void> {
        const userId = getUserId();
        await httpClient.put(`${NOTIFICATION_BASE_URL}/user/${userId}/read-all`);
    },

    /**
     * Delete a notification
     */
    async deleteNotification(id: string): Promise<void> {
        await httpClient.delete(`${NOTIFICATION_BASE_URL}/${id}`);
    },

    /**
     * Delete all user notifications
     */
    async deleteAllUserNotifications(): Promise<void> {
        const userId = getUserId();
        await httpClient.delete(`${NOTIFICATION_BASE_URL}/user/${userId}`);
    },

    /**
     * Get notification preferences (Note: This endpoint may not exist in backend yet)
     */
    async getPreferences(): Promise<NotificationPreferences> {
        const response = await httpClient.get<NotificationPreferences>(
            `${NOTIFICATION_BASE_URL}/preferences`
        );
        return response.data;
    },

    /**
     * Update notification preferences (Note: This endpoint may not exist in backend yet)
     */
    async updatePreferences(
        preferences: Partial<NotificationPreferences>
    ): Promise<NotificationPreferences> {
        const response = await httpClient.patch<NotificationPreferences>(
            `${NOTIFICATION_BASE_URL}/preferences`,
            preferences
        );
        return response.data;
    },

    /**
     * Subscribe to push notifications (Note: This endpoint may not exist in backend yet)
     */
    async subscribeToPush(subscription: PushSubscription): Promise<void> {
        await httpClient.post(`${NOTIFICATION_BASE_URL}/push/subscribe`, {
            subscription: subscription.toJSON(),
        });
    },

    /**
     * Unsubscribe from push notifications (Note: This endpoint may not exist in backend yet)
     */
    async unsubscribeFromPush(): Promise<void> {
        await httpClient.delete(`${NOTIFICATION_BASE_URL}/push/subscribe`);
    },
};

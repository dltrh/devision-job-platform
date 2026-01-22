package com.devision.job_manager_notification.service;

import com.devision.job_manager_notification.dto.external.ExternalCreateNotificationRequest;
import com.devision.job_manager_notification.dto.external.ExternalNotificationResponse;
import com.devision.job_manager_notification.dto.external.ExternalNotificationSummaryResponse;
import com.devision.job_manager_notification.dto.response.ApiResponse;
import com.devision.job_manager_notification.enums.NotificationStatus;
import com.devision.job_manager_notification.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * External service interface for notification operations.
 * Used by REST API controllers for external client requests.
 * All requests should be validated before reaching this service.
 */
public interface ExternalNotificationService {

    /**
     * Creates a notification from external API request.
     * @param request the validated notification creation request
     * @return API response containing the created notification
     */
    ApiResponse<ExternalNotificationResponse> createNotification(ExternalCreateNotificationRequest request);

    /**
     * Retrieves a notification by its ID.
     * @param notificationId the notification ID
     * @return API response containing the notification
     */
    ApiResponse<ExternalNotificationResponse> getNotificationById(UUID notificationId);

    /**
     * Retrieves paginated notifications for a user.
     * @param userId the user ID
     * @param pageable pagination parameters
     * @return API response containing paginated notifications
     */
    ApiResponse<Page<ExternalNotificationResponse>> getUserNotifications(UUID userId, Pageable pageable);

    /**
     * Retrieves paginated notifications for a user filtered by status.
     * @param userId the user ID
     * @param status the notification status
     * @param pageable pagination parameters
     * @return API response containing paginated notifications
     */
    ApiResponse<Page<ExternalNotificationResponse>> getUserNotificationsByStatus(UUID userId, NotificationStatus status, Pageable pageable);

    /**
     * Retrieves paginated notifications for a user filtered by type.
     * @param userId the user ID
     * @param type the notification type
     * @param pageable pagination parameters
     * @return API response containing paginated notifications
     */
    ApiResponse<Page<ExternalNotificationResponse>> getUserNotificationsByType(UUID userId, NotificationType type, Pageable pageable);

    /**
     * Retrieves all notifications for a user (non-paginated).
     * @param userId the user ID
     * @return API response containing all user notifications
     */
    ApiResponse<List<ExternalNotificationResponse>> getAllUserNotifications(UUID userId);

    /**
     * Marks a notification as read.
     * @param notificationId the notification ID
     * @return API response containing the updated notification
     */
    ApiResponse<ExternalNotificationResponse> markAsRead(UUID notificationId);

    /**
     * Marks all notifications as read for a user.
     * @param userId the user ID
     * @return API response with success message
     */
    ApiResponse<String> markAllAsRead(UUID userId);

    /**
     * Deletes a notification.
     * @param notificationId the notification ID
     * @return API response with success message
     */
    ApiResponse<String> deleteNotification(UUID notificationId);

    /**
     * Deletes all notifications for a user.
     * @param userId the user ID
     * @return API response with success message
     */
    ApiResponse<String> deleteAllUserNotifications(UUID userId);

    /**
     * Retrieves notification summary for a user.
     * @param userId the user ID
     * @return API response containing notification summary
     */
    ApiResponse<ExternalNotificationSummaryResponse> getUserNotificationSummary(UUID userId);

    /**
     * Cleans up old notifications.
     * @param daysOld the age threshold in days
     * @return API response with success message
     */
    ApiResponse<String> cleanupOldNotifications(int daysOld);
}

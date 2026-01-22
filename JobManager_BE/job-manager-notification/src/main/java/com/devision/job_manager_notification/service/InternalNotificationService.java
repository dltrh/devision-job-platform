package com.devision.job_manager_notification.service;

import com.devision.job_manager_notification.dto.internal.InternalCreateNotificationRequest;
import com.devision.job_manager_notification.dto.internal.InternalNotificationResponse;
import com.devision.job_manager_notification.dto.response.ApiResponse;

/**
 * Internal service interface for notification operations.
 * Used by Kafka event listeners and internal service-to-service communication.
 * Does not require request validation as data comes from trusted internal sources.
 */
public interface InternalNotificationService {

    /**
     * Creates a notification from internal sources (Kafka events, internal services).
     * @param request the notification creation request
     * @return API response containing the created notification
     */
    ApiResponse<InternalNotificationResponse> createNotification(InternalCreateNotificationRequest request);
}

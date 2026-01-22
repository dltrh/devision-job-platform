package com.devision.job_manager_notification.service;

import com.devision.job_manager_notification.dto.external.ExternalCreateNotificationRequest;
import com.devision.job_manager_notification.dto.external.ExternalNotificationResponse;
import com.devision.job_manager_notification.dto.external.ExternalNotificationSummaryResponse;
import com.devision.job_manager_notification.dto.internal.InternalCreateNotificationRequest;
import com.devision.job_manager_notification.dto.internal.InternalNotificationResponse;
import com.devision.job_manager_notification.dto.response.ApiResponse;
import com.devision.job_manager_notification.enums.NotificationStatus;
import com.devision.job_manager_notification.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface NotificationService {

    // Internal methods for Kafka events and service-to-service communication
    ApiResponse<InternalNotificationResponse> createNotification(InternalCreateNotificationRequest request);

    // External methods for REST API
    ApiResponse<ExternalNotificationResponse> createNotificationExternal(ExternalCreateNotificationRequest request);

    ApiResponse<ExternalNotificationResponse> getNotificationById(UUID notificationId);

    ApiResponse<Page<ExternalNotificationResponse>> getUserNotifications(UUID userId, Pageable pageable);

    ApiResponse<Page<ExternalNotificationResponse>> getUserNotificationsByStatus(UUID userId, NotificationStatus status, Pageable pageable);

    ApiResponse<Page<ExternalNotificationResponse>> getUserNotificationsByType(UUID userId, NotificationType type, Pageable pageable);

    ApiResponse<List<ExternalNotificationResponse>> getAllUserNotifications(UUID userId);

    ApiResponse<ExternalNotificationResponse> markAsRead(UUID notificationId);

    ApiResponse<String> markAllAsRead(UUID userId);

    ApiResponse<String> deleteNotification(UUID notificationId);

    ApiResponse<String> deleteAllUserNotifications(UUID userId);

    ApiResponse<ExternalNotificationSummaryResponse> getUserNotificationSummary(UUID userId);

    ApiResponse<String> cleanupOldNotifications(int daysOld);
}

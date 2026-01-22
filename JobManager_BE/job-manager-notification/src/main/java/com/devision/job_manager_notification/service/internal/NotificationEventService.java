package com.devision.job_manager_notification.service.internal;

import com.devision.job_manager_notification.enums.NotificationType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface NotificationEventService {

    void recordCreationEvent(UUID notificationId, UUID userId, NotificationType type, Map<String, Object> metadata);

    void recordDeliveryEvent(UUID notificationId, String channel, LocalDateTime deliveredAt, Map<String, Object> metadata);

    void recordReadEvent(UUID notificationId, UUID userId, LocalDateTime readAt);

    void recordClickEvent(UUID notificationId, UUID userId, LocalDateTime clickedAt, String actionId);

    void recordDismissalEvent(UUID notificationId, UUID userId, LocalDateTime dismissedAt);

    void recordFailureEvent(UUID notificationId, String channel, String errorMessage, LocalDateTime failedAt);

    void recordRetryEvent(UUID notificationId, String channel, int retryCount, LocalDateTime retriedAt);

    void recordExpirationEvent(UUID notificationId, LocalDateTime expiredAt);

    void recordDeletionEvent(UUID notificationId, UUID userId, LocalDateTime deletedAt);

    void recordPreferenceChangeEvent(UUID userId, String preferenceType, String oldValue, String newValue, LocalDateTime changedAt);

    void recordTemplateUsageEvent(UUID templateId, UUID notificationId, LocalDateTime usedAt);

    void recordBatchOperationEvent(UUID batchId, String operationType, int notificationCount,
                                   LocalDateTime startedAt, LocalDateTime completedAt);

    List<Map<String, Object>> getNotificationEvents(UUID notificationId);

    List<Map<String, Object>> getUserEvents(UUID userId, LocalDateTime startDate, LocalDateTime endDate);

    List<Map<String, Object>> getEventsByType(String eventType, LocalDateTime startDate, LocalDateTime endDate);

    double getDeliverySuccessRate(LocalDateTime startDate, LocalDateTime endDate);

    long getAverageTimeToDelivery(LocalDateTime startDate, LocalDateTime endDate);

    long getAverageTimeToRead(LocalDateTime startDate, LocalDateTime endDate);

    long getEventCount(String eventType, LocalDateTime startDate, LocalDateTime endDate);

    long archiveOldEvents(int olderThanDays);

    long purgeArchivedEvents(int olderThanDays);

    String exportEventsToCSV(UUID notificationId);

    String generateAuditReport(UUID userId, LocalDateTime startDate, LocalDateTime endDate);

    void recordCustomEvent(String eventType, Map<String, Object> eventData);

    Map<String, Object> getEventStatistics(LocalDateTime startDate, LocalDateTime endDate);

    void recordSecurityEvent(UUID userId, String eventType, String details, LocalDateTime timestamp);

    List<Map<String, Object>> getSecurityEvents(LocalDateTime startDate, LocalDateTime endDate);

    void recordComplianceEvent(String eventType, UUID userId, String details, LocalDateTime timestamp);

    List<Map<String, Object>> getComplianceEvents(LocalDateTime startDate, LocalDateTime endDate);
}

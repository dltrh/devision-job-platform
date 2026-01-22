package com.devision.job_manager_notification.service.external;

import com.devision.job_manager_notification.enums.NotificationType;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

public interface NotificationAnalyticsService {

    double getDeliveryRate(NotificationType type, LocalDate startDate, LocalDate endDate);

    double getOpenRate(NotificationType type, LocalDate startDate, LocalDate endDate);

    double getClickThroughRate(NotificationType type, LocalDate startDate, LocalDate endDate);

    long getTotalNotificationsSent(LocalDate startDate, LocalDate endDate);

    long getTotalNotificationsDelivered(LocalDate startDate, LocalDate endDate);

    long getTotalNotificationsRead(LocalDate startDate, LocalDate endDate);

    long getAverageTimeToRead(LocalDate startDate, LocalDate endDate);

    Map<NotificationType, Map<String, Object>> getPerformanceByType(LocalDate startDate, LocalDate endDate);

    Map<Integer, Long> getPeakNotificationTimes(LocalDate startDate, LocalDate endDate);

    double getUserEngagementScore(UUID userId, LocalDate startDate, LocalDate endDate);

    Map<UUID, Double> getTopPerformingNotifications(int limit, LocalDate startDate, LocalDate endDate);

    Map<LocalDate, Long> getNotificationTrends(NotificationType type, LocalDate startDate, LocalDate endDate);

    double getReadRate(NotificationType type, LocalDate startDate, LocalDate endDate);

    double getDismissalRate(NotificationType type, LocalDate startDate, LocalDate endDate);

    double getConversionRate(String referenceType, LocalDate startDate, LocalDate endDate);

    Map<String, Object> generateAnalyticsReport(LocalDate startDate, LocalDate endDate);

    String exportAnalyticsToCSV(LocalDate startDate, LocalDate endDate);

    Map<String, Object> getRealtimeStatistics();

    Map<String, Long> getActionClickStatistics(LocalDate startDate, LocalDate endDate);

    double getAverageNotificationsPerUser(LocalDate startDate, LocalDate endDate);

    long getActiveUsersCount(LocalDate startDate, LocalDate endDate);

    double getRetentionRate(LocalDate startDate, LocalDate endDate);
}

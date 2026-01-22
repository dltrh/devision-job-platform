package com.devision.job_manager_notification.service.internal;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface NotificationQueueService {

    boolean enqueue(UUID notificationId, int priority);

    boolean dequeue(UUID notificationId);

    UUID getNext();

    List<UUID> getBatch(int batchSize);

    long getQueueSize();

    long clearQueue();

    boolean requeue(UUID notificationId, int newPriority);

    boolean moveToDeadLetterQueue(UUID notificationId, String reason);

    List<UUID> getDeadLetterQueue(int limit);

    boolean retryFromDeadLetterQueue(UUID notificationId);

    java.util.Map<String, Object> getQueueStatistics();

    boolean pauseQueue();

    boolean resumeQueue();

    boolean isQueuePaused();

    boolean setMaxQueueSize(long maxSize);

    long getMaxQueueSize();

    boolean isInQueue(UUID notificationId);

    int getQueuePosition(UUID notificationId);

    long getEstimatedWaitTime(UUID notificationId);

    int bulkEnqueue(List<UUID> notificationIds, int priority);

    List<UUID> getNotificationsQueuedBefore(LocalDateTime timestamp);

    int removeStaleNotifications(int thresholdMinutes);

    boolean reorderQueue();

    String getQueueHealth();

    long archiveProcessedNotifications(int olderThanDays);

    double getProcessingRate();

    boolean setRateLimit(int maxPerSecond);

    int getRateLimit();

    long getAverageProcessingTime();

    long getFailedProcessingCount();

    boolean resetStatistics();
}

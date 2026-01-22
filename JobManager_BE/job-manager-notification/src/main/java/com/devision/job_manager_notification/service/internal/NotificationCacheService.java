package com.devision.job_manager_notification.service.internal;

import com.devision.job_manager_notification.enums.NotificationType;
import com.devision.job_manager_notification.entity.Notification;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface NotificationCacheService {

    void cacheNotification(Notification notification, Duration ttl);

    Notification getCachedNotification(UUID notificationId);

    void evictNotification(UUID notificationId);

    void cacheUserPreferences(UUID userId, Map<String, Object> preferences, Duration ttl);

    Map<String, Object> getCachedUserPreferences(UUID userId);

    void evictUserPreferences(UUID userId);

    void cacheTemplate(UUID templateId, String templateContent, Duration ttl);

    String getCachedTemplate(UUID templateId);

    void evictTemplate(UUID templateId);

    void cacheNotificationCount(UUID userId, long count, Duration ttl);

    Long getCachedNotificationCount(UUID userId);

    long incrementNotificationCount(UUID userId);

    long decrementNotificationCount(UUID userId);

    void cacheUnreadCount(UUID userId, long count, Duration ttl);

    Long getCachedUnreadCount(UUID userId);

    void cacheRecentNotifications(UUID userId, List<Notification> notifications, Duration ttl);

    List<Notification> getCachedRecentNotifications(UUID userId);

    void cacheDeliveryStatus(UUID notificationId, String status, Duration ttl);

    String getCachedDeliveryStatus(UUID notificationId);

    void cacheAnalytics(String key, Map<String, Object> data, Duration ttl);

    Map<String, Object> getCachedAnalytics(String key);

    void cacheRateLimitCounter(UUID userId, NotificationType type, int count, Duration ttl);

    Integer getCachedRateLimitCounter(UUID userId, NotificationType type);

    int incrementRateLimitCounter(UUID userId, NotificationType type);

    void clearAllCache();

    void clearUserCache(UUID userId);

    void clearTypeCache(NotificationType type);

    Map<String, Object> getCacheStatistics();

    void warmUpCache();

    boolean exists(String key);

    long getRemainingTTL(String key);

    boolean updateTTL(String key, Duration newTtl);

    double getCacheHitRate();

    double getCacheMissRate();

    long getCacheSize();

    long getCacheEntryCount();

    long evictExpiredEntries();

    long evictLRU(long targetSize);

    void cacheList(String pattern, List<?> items, Duration ttl);

    List<?> getCachedList(String pattern);

    long bulkEvict(String pattern);

    String exportCache();

    boolean importCache(String cacheData);

    String getCacheHealth();
}

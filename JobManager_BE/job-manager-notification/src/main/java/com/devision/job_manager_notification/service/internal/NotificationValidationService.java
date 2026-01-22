package com.devision.job_manager_notification.service.internal;

import com.devision.job_manager_notification.enums.NotificationType;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface NotificationValidationService {

    List<String> validateNotificationData(UUID userId, NotificationType type, String title, String message);

    String validateTitle(String title);

    String validateMessage(String message);

    String validateUserId(UUID userId);

    String validateNotificationType(NotificationType type);

    String validateReferenceId(String referenceId);

    String validateReferenceType(String referenceType);

    List<String> validateMetadata(Map<String, String> metadata);

    String validateScheduledTime(String scheduledTime);

    String validatePriority(int priority);

    String validateExpirationTime(String expiresAt);

    boolean isRateLimitExceeded(UUID userId, NotificationType type);

    boolean isSpam(String title, String message);

    boolean containsProfanity(String content);

    List<String> validateUrls(String content);

    boolean isDuplicate(UUID userId, NotificationType type, String message, int windowMinutes);

    List<String> validateBatchNotification(List<UUID> userIds, NotificationType type, String title, String message);

    List<String> validateTemplateVariables(UUID templateId, Map<String, Object> variables);

    boolean hasUserConsent(UUID userId, NotificationType type);

    String validateSize(String title, String message, Map<String, String> metadata);

    String validateEncoding(String content);

    String validateAttachment(String attachmentUrl, String attachmentType);

    List<String> validateActions(List<Map<String, String>> actions);

    String validateCategory(String category);

    List<String> validateTags(List<String> tags);

    boolean isInQuietHours(UUID userId);

    String validateLocalization(String languageCode, String localizationKey);

    Map<String, List<String>> performComprehensiveValidation(Map<String, Object> notificationData);

    List<String> validateAgainstBusinessRules(Map<String, Object> notificationData, String ruleSetName);

    String sanitizeContent(String content);

    List<String> validateGDPRCompliance(UUID userId, NotificationType type, Map<String, Object> data);
}

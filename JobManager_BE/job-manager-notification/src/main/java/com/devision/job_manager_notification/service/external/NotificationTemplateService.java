package com.devision.job_manager_notification.service.external;

import com.devision.job_manager_notification.enums.NotificationType;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface NotificationTemplateService {

    UUID createTemplate(String name, NotificationType type, String subject, String body);

    boolean updateTemplate(UUID templateId, String subject, String body);

    boolean deleteTemplate(UUID templateId);

    String getTemplate(UUID templateId);

    List<UUID> getTemplatesByType(NotificationType type);

    String renderTemplate(UUID templateId, Map<String, Object> variables);

    boolean validateTemplate(String templateContent);

    List<String> getAvailableVariables(NotificationType type);

    UUID cloneTemplate(UUID templateId, String newName);

    boolean activateTemplate(UUID templateId);

    boolean deactivateTemplate(UUID templateId);

    UUID getActiveTemplate(NotificationType type);

    String previewTemplate(UUID templateId);

    String exportTemplate(UUID templateId, String format);

    UUID importTemplate(String content, String format);

    List<UUID> searchTemplates(String keyword);

    long getTemplateUsageCount(UUID templateId);

    List<String> validateTemplateVariables(UUID templateId, Map<String, Object> variables);
}

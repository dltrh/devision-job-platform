package com.devision.job_manager_notification.service.external.impl;

import com.devision.job_manager_notification.enums.NotificationType;
import com.devision.job_manager_notification.service.external.NotificationTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationTemplateServiceImpl implements NotificationTemplateService {

    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\{\\{([a-zA-Z0-9_]+)\\}\\}");
    private static final int MAX_TEMPLATE_SIZE = 10000;

    @Override
    public UUID createTemplate(String name, NotificationType type, String subject, String body) {
        log.info("Creating notification template: {} for type: {}", name, type);

        try {
            // Validate input parameters
            if (name == null || name.trim().isEmpty()) {
                log.error("Template name is null or empty");
                throw new IllegalArgumentException("Template name is required");
            }

            if (type == null) {
                log.error("Notification type is null");
                throw new IllegalArgumentException("Notification type is required");
            }

            if (subject == null || subject.trim().isEmpty()) {
                log.error("Template subject is null or empty");
                throw new IllegalArgumentException("Template subject is required");
            }

            if (body == null || body.trim().isEmpty()) {
                log.error("Template body is null or empty");
                throw new IllegalArgumentException("Template body is required");
            }

            // Validate template syntax
            if (!validateTemplate(body)) {
                log.error("Template body has invalid syntax");
                throw new IllegalArgumentException("Invalid template syntax");
            }

            // Validate size
            if ((subject.length() + body.length()) > MAX_TEMPLATE_SIZE) {
                log.error("Template size exceeds maximum allowed size");
                throw new IllegalArgumentException("Template size exceeds limit");
            }

            // TODO: Implement actual template storage
            UUID templateId = UUID.randomUUID();
            log.info("Successfully created template with ID: {}", templateId);

            return templateId;

        } catch (IllegalArgumentException e) {
            log.error("Validation error creating template: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error creating template", e);
            throw new RuntimeException("Failed to create template", e);
        }
    }

    @Override
    public boolean updateTemplate(UUID templateId, String subject, String body) {
        log.info("Updating template: {}", templateId);

        try {
            if (templateId == null) {
                log.error("Template ID is null");
                return false;
            }

            if (subject == null || subject.trim().isEmpty()) {
                log.error("Template subject is null or empty");
                return false;
            }

            if (body == null || body.trim().isEmpty()) {
                log.error("Template body is null or empty");
                return false;
            }

            if (!validateTemplate(body)) {
                log.error("Template body has invalid syntax");
                return false;
            }

            // TODO: Implement actual template update
            log.info("Successfully updated template: {}", templateId);
            return true;

        } catch (Exception e) {
            log.error("Error updating template: {}", templateId, e);
            return false;
        }
    }

    @Override
    public boolean deleteTemplate(UUID templateId) {
        log.info("Deleting template: {}", templateId);

        try {
            if (templateId == null) {
                log.error("Template ID is null");
                return false;
            }

            // TODO: Implement actual template deletion
            log.info("Successfully deleted template: {}", templateId);
            return true;

        } catch (Exception e) {
            log.error("Error deleting template: {}", templateId, e);
            return false;
        }
    }

    @Override
    public String getTemplate(UUID templateId) {
        log.debug("Getting template: {}", templateId);

        try {
            if (templateId == null) {
                log.error("Template ID is null");
                return null;
            }

            // TODO: Implement actual template retrieval
            return "Mock template content for ID: " + templateId;

        } catch (Exception e) {
            log.error("Error getting template: {}", templateId, e);
            return null;
        }
    }

    @Override
    public List<UUID> getTemplatesByType(NotificationType type) {
        log.debug("Getting templates for type: {}", type);

        try {
            if (type == null) {
                log.error("Notification type is null");
                return new ArrayList<>();
            }

            // TODO: Implement actual template retrieval by type
            return new ArrayList<>();

        } catch (Exception e) {
            log.error("Error getting templates for type: {}", type, e);
            return new ArrayList<>();
        }
    }

    @Override
    public String renderTemplate(UUID templateId, Map<String, Object> variables) {
        log.debug("Rendering template: {} with {} variables", templateId, variables != null ? variables.size() : 0);

        try {
            if (templateId == null) {
                log.error("Template ID is null");
                return null;
            }

            String template = getTemplate(templateId);
            if (template == null) {
                log.error("Template not found: {}", templateId);
                return null;
            }

            if (variables == null || variables.isEmpty()) {
                log.warn("No variables provided for template rendering");
                return template;
            }

            // Render template by substituting variables
            String rendered = template;
            Matcher matcher = VARIABLE_PATTERN.matcher(template);

            while (matcher.find()) {
                String variableName = matcher.group(1);
                Object value = variables.get(variableName);

                if (value != null) {
                    String placeholder = "{{" + variableName + "}}";
                    rendered = rendered.replace(placeholder, value.toString());
                    log.debug("Replaced variable: {} with value: {}", variableName, value);
                } else {
                    log.warn("Variable not found in provided map: {}", variableName);
                }
            }

            log.debug("Successfully rendered template: {}", templateId);
            return rendered;

        } catch (Exception e) {
            log.error("Error rendering template: {}", templateId, e);
            return null;
        }
    }

    @Override
    public boolean validateTemplate(String templateContent) {
        log.debug("Validating template content");

        try {
            if (templateContent == null || templateContent.trim().isEmpty()) {
                log.error("Template content is null or empty");
                return false;
            }

            // Check for balanced variable placeholders
            int openCount = 0;
            int closeCount = 0;

            for (int i = 0; i < templateContent.length() - 1; i++) {
                if (templateContent.charAt(i) == '{' && templateContent.charAt(i + 1) == '{') {
                    openCount++;
                    i++; // Skip next character
                }
                if (templateContent.charAt(i) == '}' && templateContent.charAt(i + 1) == '}') {
                    closeCount++;
                    i++; // Skip next character
                }
            }

            if (openCount != closeCount) {
                log.error("Template has unbalanced variable placeholders. Open: {}, Close: {}", openCount, closeCount);
                return false;
            }

            // Validate variable names
            Matcher matcher = VARIABLE_PATTERN.matcher(templateContent);
            while (matcher.find()) {
                String variableName = matcher.group(1);
                if (variableName == null || variableName.trim().isEmpty()) {
                    log.error("Empty variable name found in template");
                    return false;
                }
                log.debug("Found valid variable: {}", variableName);
            }

            log.debug("Template validation successful");
            return true;

        } catch (Exception e) {
            log.error("Error validating template", e);
            return false;
        }
    }

    @Override
    public List<String> getAvailableVariables(NotificationType type) {
        log.debug("Getting available variables for type: {}", type);

        try {
            if (type == null) {
                log.error("Notification type is null");
                return new ArrayList<>();
            }

            // TODO: Implement actual available variables retrieval based on type
            List<String> variables = new ArrayList<>();
            variables.add("userId");
            variables.add("userName");
            variables.add("userEmail");
            variables.add("notificationTitle");
            variables.add("notificationMessage");
            variables.add("timestamp");
            variables.add("referenceId");
            variables.add("referenceType");

            log.debug("Found {} available variables for type: {}", variables.size(), type);
            return variables;

        } catch (Exception e) {
            log.error("Error getting available variables for type: {}", type, e);
            return new ArrayList<>();
        }
    }

    @Override
    public UUID cloneTemplate(UUID templateId, String newName) {
        log.info("Cloning template: {} with new name: {}", templateId, newName);

        try {
            if (templateId == null) {
                log.error("Template ID is null");
                return null;
            }

            if (newName == null || newName.trim().isEmpty()) {
                log.error("New template name is null or empty");
                return null;
            }

            // TODO: Implement actual template cloning
            UUID newTemplateId = UUID.randomUUID();
            log.info("Successfully cloned template. New ID: {}", newTemplateId);

            return newTemplateId;

        } catch (Exception e) {
            log.error("Error cloning template: {}", templateId, e);
            return null;
        }
    }

    @Override
    public boolean activateTemplate(UUID templateId) {
        log.info("Activating template: {}", templateId);

        try {
            if (templateId == null) {
                log.error("Template ID is null");
                return false;
            }

            // TODO: Implement actual template activation
            log.info("Successfully activated template: {}", templateId);
            return true;

        } catch (Exception e) {
            log.error("Error activating template: {}", templateId, e);
            return false;
        }
    }

    @Override
    public boolean deactivateTemplate(UUID templateId) {
        log.info("Deactivating template: {}", templateId);

        try {
            if (templateId == null) {
                log.error("Template ID is null");
                return false;
            }

            // TODO: Implement actual template deactivation
            log.info("Successfully deactivated template: {}", templateId);
            return true;

        } catch (Exception e) {
            log.error("Error deactivating template: {}", templateId, e);
            return false;
        }
    }

    @Override
    public UUID getActiveTemplate(NotificationType type) {
        log.debug("Getting active template for type: {}", type);

        try {
            if (type == null) {
                log.error("Notification type is null");
                return null;
            }

            // TODO: Implement actual active template retrieval
            return null;

        } catch (Exception e) {
            log.error("Error getting active template for type: {}", type, e);
            return null;
        }
    }

    @Override
    public String previewTemplate(UUID templateId) {
        log.debug("Previewing template: {}", templateId);

        try {
            if (templateId == null) {
                log.error("Template ID is null");
                return null;
            }

            // Get template
            String template = getTemplate(templateId);
            if (template == null) {
                log.error("Template not found: {}", templateId);
                return null;
            }

            // Create sample data
            Map<String, Object> sampleData = new HashMap<>();
            sampleData.put("userId", "user-123");
            sampleData.put("userName", "John Doe");
            sampleData.put("userEmail", "john.doe@example.com");
            sampleData.put("notificationTitle", "Sample Notification");
            sampleData.put("notificationMessage", "This is a sample message");
            sampleData.put("timestamp", new Date().toString());
            sampleData.put("referenceId", "ref-456");
            sampleData.put("referenceType", "SAMPLE_TYPE");

            // Render with sample data
            String preview = renderTemplate(templateId, sampleData);
            log.debug("Successfully generated preview for template: {}", templateId);

            return preview;

        } catch (Exception e) {
            log.error("Error previewing template: {}", templateId, e);
            return null;
        }
    }

    @Override
    public String exportTemplate(UUID templateId, String format) {
        log.info("Exporting template: {} to format: {}", templateId, format);

        try {
            if (templateId == null) {
                log.error("Template ID is null");
                return null;
            }

            if (format == null || format.trim().isEmpty()) {
                log.error("Export format is null or empty");
                return null;
            }

            // TODO: Implement actual template export
            String template = getTemplate(templateId);
            if (template == null) {
                log.error("Template not found: {}", templateId);
                return null;
            }

            log.info("Successfully exported template: {} to format: {}", templateId, format);
            return template;

        } catch (Exception e) {
            log.error("Error exporting template: {}", templateId, e);
            return null;
        }
    }

    @Override
    public UUID importTemplate(String content, String format) {
        log.info("Importing template from format: {}", format);

        try {
            if (content == null || content.trim().isEmpty()) {
                log.error("Template content is null or empty");
                return null;
            }

            if (format == null || format.trim().isEmpty()) {
                log.error("Import format is null or empty");
                return null;
            }

            // TODO: Implement actual template import
            UUID templateId = UUID.randomUUID();
            log.info("Successfully imported template with ID: {}", templateId);

            return templateId;

        } catch (Exception e) {
            log.error("Error importing template", e);
            return null;
        }
    }

    @Override
    public List<UUID> searchTemplates(String keyword) {
        log.debug("Searching templates with keyword: {}", keyword);

        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                log.error("Search keyword is null or empty");
                return new ArrayList<>();
            }

            // TODO: Implement actual template search
            return new ArrayList<>();

        } catch (Exception e) {
            log.error("Error searching templates with keyword: {}", keyword, e);
            return new ArrayList<>();
        }
    }

    @Override
    public long getTemplateUsageCount(UUID templateId) {
        log.debug("Getting usage count for template: {}", templateId);

        try {
            if (templateId == null) {
                log.error("Template ID is null");
                return 0;
            }

            // TODO: Implement actual usage count retrieval
            return 0;

        } catch (Exception e) {
            log.error("Error getting usage count for template: {}", templateId, e);
            return 0;
        }
    }

    @Override
    public List<String> validateTemplateVariables(UUID templateId, Map<String, Object> variables) {
        log.debug("Validating template variables for template: {}", templateId);

        List<String> errors = new ArrayList<>();

        try {
            if (templateId == null) {
                log.error("Template ID is null");
                errors.add("Template ID is required");
                return errors;
            }

            String template = getTemplate(templateId);
            if (template == null) {
                log.error("Template not found: {}", templateId);
                errors.add("Template not found");
                return errors;
            }

            if (variables == null) {
                variables = new HashMap<>();
            }

            // Extract required variables from template
            Set<String> requiredVariables = new HashSet<>();
            Matcher matcher = VARIABLE_PATTERN.matcher(template);
            while (matcher.find()) {
                requiredVariables.add(matcher.group(1));
            }

            // Check for missing variables
            for (String requiredVar : requiredVariables) {
                if (!variables.containsKey(requiredVar) || variables.get(requiredVar) == null) {
                    String error = "Missing required variable: " + requiredVar;
                    log.warn(error);
                    errors.add(error);
                }
            }

            if (errors.isEmpty()) {
                log.debug("All required variables are provided for template: {}", templateId);
            } else {
                log.warn("Found {} missing variables for template: {}", errors.size(), templateId);
            }

            return errors;

        } catch (Exception e) {
            log.error("Error validating template variables for template: {}", templateId, e);
            errors.add("Error validating variables: " + e.getMessage());
            return errors;
        }
    }
}

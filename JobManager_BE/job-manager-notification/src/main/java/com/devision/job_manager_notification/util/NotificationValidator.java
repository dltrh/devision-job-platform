package com.devision.job_manager_notification.util;

import com.devision.job_manager_notification.enums.NotificationType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Utility class for validating notification data and content.
 * Provides comprehensive validation for all notification-related fields.
 */
@Component
@Slf4j
public class NotificationValidator {

    private static final int MIN_TITLE_LENGTH = 1;
    private static final int MAX_TITLE_LENGTH = 200;
    private static final int MIN_MESSAGE_LENGTH = 1;
    private static final int MAX_MESSAGE_LENGTH = 5000;
    private static final int MAX_METADATA_ENTRIES = 50;
    private static final int MAX_METADATA_KEY_LENGTH = 100;
    private static final int MAX_METADATA_VALUE_LENGTH = 500;

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "^\\+?[1-9]\\d{1,14}$"
    );

    private static final Pattern UUID_PATTERN = Pattern.compile(
            "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
            Pattern.CASE_INSENSITIVE
    );

    private static final Set<String> SPAM_KEYWORDS = new HashSet<>(Arrays.asList(
            "viagra", "casino", "lottery", "winner", "free money", "click here",
            "limited time", "act now", "congratulations", "prize"
    ));

    private static final Set<String> PROFANITY_WORDS = new HashSet<>(Arrays.asList(
            "badword1", "badword2" // Placeholder - implement actual list
    ));

    /**
     * Validates notification title.
     *
     * @param title the title to validate
     * @return validation error message, or null if valid
     */
    public String validateTitle(String title) {
        log.debug("Validating notification title");

        try {
            if (title == null) {
                return "Title cannot be null";
            }

            String trimmed = title.trim();

            if (trimmed.isEmpty()) {
                return "Title cannot be empty";
            }

            if (trimmed.length() < MIN_TITLE_LENGTH) {
                return "Title is too short (minimum " + MIN_TITLE_LENGTH + " characters)";
            }

            if (trimmed.length() > MAX_TITLE_LENGTH) {
                return "Title is too long (maximum " + MAX_TITLE_LENGTH + " characters)";
            }

            // Check for spam
            if (containsSpam(trimmed)) {
                return "Title contains spam-like content";
            }

            // Check for profanity
            if (containsProfanity(trimmed)) {
                return "Title contains inappropriate language";
            }

            log.debug("Title validation passed");
            return null;

        } catch (Exception e) {
            log.error("Error validating title", e);
            return "Error validating title: " + e.getMessage();
        }
    }

    /**
     * Validates notification message.
     *
     * @param message the message to validate
     * @return validation error message, or null if valid
     */
    public String validateMessage(String message) {
        log.debug("Validating notification message");

        try {
            if (message == null) {
                return "Message cannot be null";
            }

            String trimmed = message.trim();

            if (trimmed.isEmpty()) {
                return "Message cannot be empty";
            }

            if (trimmed.length() < MIN_MESSAGE_LENGTH) {
                return "Message is too short (minimum " + MIN_MESSAGE_LENGTH + " characters)";
            }

            if (trimmed.length() > MAX_MESSAGE_LENGTH) {
                return "Message is too long (maximum " + MAX_MESSAGE_LENGTH + " characters)";
            }

            // Check for spam
            if (containsSpam(trimmed)) {
                return "Message contains spam-like content";
            }

            // Check for profanity
            if (containsProfanity(trimmed)) {
                return "Message contains inappropriate language";
            }

            log.debug("Message validation passed");
            return null;

        } catch (Exception e) {
            log.error("Error validating message", e);
            return "Error validating message: " + e.getMessage();
        }
    }

    /**
     * Validates user ID format.
     *
     * @param userId the user ID string
     * @return validation error message, or null if valid
     */
    public String validateUserId(String userId) {
        log.debug("Validating user ID");

        try {
            if (userId == null || userId.trim().isEmpty()) {
                return "User ID cannot be null or empty";
            }

            if (!UUID_PATTERN.matcher(userId.trim()).matches()) {
                return "User ID must be a valid UUID";
            }

            log.debug("User ID validation passed");
            return null;

        } catch (Exception e) {
            log.error("Error validating user ID", e);
            return "Error validating user ID: " + e.getMessage();
        }
    }

    /**
     * Validates notification type.
     *
     * @param type the notification type
     * @return validation error message, or null if valid
     */
    public String validateNotificationType(NotificationType type) {
        log.debug("Validating notification type: {}", type);

        try {
            if (type == null) {
                return "Notification type cannot be null";
            }

            log.debug("Notification type validation passed");
            return null;

        } catch (Exception e) {
            log.error("Error validating notification type", e);
            return "Error validating notification type: " + e.getMessage();
        }
    }

    /**
     * Validates metadata map.
     *
     * @param metadata the metadata to validate
     * @return list of validation errors, empty if valid
     */
    public List<String> validateMetadata(Map<String, String> metadata) {
        log.debug("Validating notification metadata");

        List<String> errors = new ArrayList<>();

        try {
            if (metadata == null) {
                log.debug("Metadata is null, skipping validation");
                return errors;
            }

            if (metadata.size() > MAX_METADATA_ENTRIES) {
                errors.add("Too many metadata entries (maximum " + MAX_METADATA_ENTRIES + ")");
            }

            for (Map.Entry<String, String> entry : metadata.entrySet()) {
                String key = entry.getKey();
                String value = entry.getValue();

                if (key == null || key.trim().isEmpty()) {
                    errors.add("Metadata key cannot be null or empty");
                    continue;
                }

                if (key.length() > MAX_METADATA_KEY_LENGTH) {
                    errors.add("Metadata key too long: " + key + " (maximum " + MAX_METADATA_KEY_LENGTH + ")");
                }

                if (value != null && value.length() > MAX_METADATA_VALUE_LENGTH) {
                    errors.add("Metadata value too long for key '" + key + "' (maximum " + MAX_METADATA_VALUE_LENGTH + ")");
                }
            }

            if (errors.isEmpty()) {
                log.debug("Metadata validation passed");
            } else {
                log.warn("Metadata validation failed with {} errors", errors.size());
            }

        } catch (Exception e) {
            log.error("Error validating metadata", e);
            errors.add("Error validating metadata: " + e.getMessage());
        }

        return errors;
    }

    /**
     * Validates email address format.
     *
     * @param email the email to validate
     * @return validation error message, or null if valid
     */
    public String validateEmail(String email) {
        log.debug("Validating email address");

        try {
            if (email == null || email.trim().isEmpty()) {
                return "Email cannot be null or empty";
            }

            if (!EMAIL_PATTERN.matcher(email.trim()).matches()) {
                return "Invalid email format";
            }

            log.debug("Email validation passed");
            return null;

        } catch (Exception e) {
            log.error("Error validating email", e);
            return "Error validating email: " + e.getMessage();
        }
    }

    /**
     * Validates phone number format.
     *
     * @param phone the phone number to validate
     * @return validation error message, or null if valid
     */
    public String validatePhone(String phone) {
        log.debug("Validating phone number");

        try {
            if (phone == null || phone.trim().isEmpty()) {
                return "Phone number cannot be null or empty";
            }

            String cleaned = phone.trim().replaceAll("\\s+", "");

            if (!PHONE_PATTERN.matcher(cleaned).matches()) {
                return "Invalid phone number format";
            }

            log.debug("Phone validation passed");
            return null;

        } catch (Exception e) {
            log.error("Error validating phone", e);
            return "Error validating phone: " + e.getMessage();
        }
    }

    /**
     * Validates URL format.
     *
     * @param url the URL to validate
     * @return validation error message, or null if valid
     */
    public String validateUrl(String url) {
        log.debug("Validating URL");

        try {
            if (url == null || url.trim().isEmpty()) {
                return "URL cannot be null or empty";
            }

            try {
                new URL(url.trim());
            } catch (MalformedURLException e) {
                return "Invalid URL format";
            }

            log.debug("URL validation passed");
            return null;

        } catch (Exception e) {
            log.error("Error validating URL", e);
            return "Error validating URL: " + e.getMessage();
        }
    }

    /**
     * Validates scheduled time is in the future.
     *
     * @param scheduledTime the scheduled time
     * @return validation error message, or null if valid
     */
    public String validateScheduledTime(LocalDateTime scheduledTime) {
        log.debug("Validating scheduled time: {}", scheduledTime);

        try {
            if (scheduledTime == null) {
                return "Scheduled time cannot be null";
            }

            if (scheduledTime.isBefore(LocalDateTime.now())) {
                return "Scheduled time must be in the future";
            }

            log.debug("Scheduled time validation passed");
            return null;

        } catch (Exception e) {
            log.error("Error validating scheduled time", e);
            return "Error validating scheduled time: " + e.getMessage();
        }
    }

    /**
     * Validates priority value.
     *
     * @param priority the priority value
     * @return validation error message, or null if valid
     */
    public String validatePriority(int priority) {
        log.debug("Validating priority: {}", priority);

        try {
            if (priority < 1 || priority > 10) {
                return "Priority must be between 1 and 10";
            }

            log.debug("Priority validation passed");
            return null;

        } catch (Exception e) {
            log.error("Error validating priority", e);
            return "Error validating priority: " + e.getMessage();
        }
    }

    /**
     * Checks if content contains spam keywords.
     *
     * @param content the content to check
     * @return true if spam detected
     */
    public boolean containsSpam(String content) {
        log.debug("Checking content for spam");

        try {
            if (content == null || content.trim().isEmpty()) {
                return false;
            }

            String lowercase = content.toLowerCase();

            for (String keyword : SPAM_KEYWORDS) {
                if (lowercase.contains(keyword)) {
                    log.warn("Spam keyword detected: {}", keyword);
                    return true;
                }
            }

            log.debug("No spam detected");
            return false;

        } catch (Exception e) {
            log.error("Error checking for spam", e);
            return false;
        }
    }

    /**
     * Checks if content contains profanity.
     *
     * @param content the content to check
     * @return true if profanity detected
     */
    public boolean containsProfanity(String content) {
        log.debug("Checking content for profanity");

        try {
            if (content == null || content.trim().isEmpty()) {
                return false;
            }

            String lowercase = content.toLowerCase();

            for (String word : PROFANITY_WORDS) {
                if (lowercase.contains(word)) {
                    log.warn("Profanity detected");
                    return true;
                }
            }

            log.debug("No profanity detected");
            return false;

        } catch (Exception e) {
            log.error("Error checking for profanity", e);
            return false;
        }
    }

    /**
     * Validates reference ID format.
     *
     * @param referenceId the reference ID
     * @return validation error message, or null if valid
     */
    public String validateReferenceId(String referenceId) {
        log.debug("Validating reference ID");

        try {
            if (referenceId == null || referenceId.trim().isEmpty()) {
                return "Reference ID cannot be null or empty";
            }

            if (referenceId.length() > 255) {
                return "Reference ID is too long (maximum 255 characters)";
            }

            log.debug("Reference ID validation passed");
            return null;

        } catch (Exception e) {
            log.error("Error validating reference ID", e);
            return "Error validating reference ID: " + e.getMessage();
        }
    }

    /**
     * Validates reference type.
     *
     * @param referenceType the reference type
     * @return validation error message, or null if valid
     */
    public String validateReferenceType(String referenceType) {
        log.debug("Validating reference type");

        try {
            if (referenceType == null || referenceType.trim().isEmpty()) {
                return "Reference type cannot be null or empty";
            }

            if (referenceType.length() > 100) {
                return "Reference type is too long (maximum 100 characters)";
            }

            // Validate format (uppercase with underscores)
            if (!referenceType.matches("^[A-Z_]+$")) {
                return "Reference type must contain only uppercase letters and underscores";
            }

            log.debug("Reference type validation passed");
            return null;

        } catch (Exception e) {
            log.error("Error validating reference type", e);
            return "Error validating reference type: " + e.getMessage();
        }
    }

    /**
     * Performs comprehensive validation of all notification data.
     *
     * @param userId the user ID
     * @param type the notification type
     * @param title the title
     * @param message the message
     * @param metadata the metadata
     * @return list of all validation errors, empty if valid
     */
    public List<String> validateAll(String userId, NotificationType type, String title,
                                    String message, Map<String, String> metadata) {
        log.debug("Performing comprehensive validation");

        List<String> errors = new ArrayList<>();

        try {
            String userIdError = validateUserId(userId);
            if (userIdError != null) {
                errors.add(userIdError);
            }

            String typeError = validateNotificationType(type);
            if (typeError != null) {
                errors.add(typeError);
            }

            String titleError = validateTitle(title);
            if (titleError != null) {
                errors.add(titleError);
            }

            String messageError = validateMessage(message);
            if (messageError != null) {
                errors.add(messageError);
            }

            List<String> metadataErrors = validateMetadata(metadata);
            errors.addAll(metadataErrors);

            if (errors.isEmpty()) {
                log.debug("Comprehensive validation passed");
            } else {
                log.warn("Comprehensive validation failed with {} errors", errors.size());
            }

        } catch (Exception e) {
            log.error("Error in comprehensive validation", e);
            errors.add("Error in validation: " + e.getMessage());
        }

        return errors;
    }

    /**
     * Validates batch size for bulk operations.
     *
     * @param batchSize the batch size
     * @param maxBatchSize the maximum allowed batch size
     * @return validation error message, or null if valid
     */
    public String validateBatchSize(int batchSize, int maxBatchSize) {
        log.debug("Validating batch size: {}", batchSize);

        try {
            if (batchSize <= 0) {
                return "Batch size must be positive";
            }

            if (batchSize > maxBatchSize) {
                return "Batch size exceeds maximum (" + maxBatchSize + ")";
            }

            log.debug("Batch size validation passed");
            return null;

        } catch (Exception e) {
            log.error("Error validating batch size", e);
            return "Error validating batch size: " + e.getMessage();
        }
    }

    /**
     * Validates expiration time.
     *
     * @param expiresAt the expiration time
     * @return validation error message, or null if valid
     */
    public String validateExpirationTime(LocalDateTime expiresAt) {
        log.debug("Validating expiration time: {}", expiresAt);

        try {
            if (expiresAt == null) {
                return null; // Expiration is optional
            }

            if (expiresAt.isBefore(LocalDateTime.now())) {
                return "Expiration time must be in the future";
            }

            log.debug("Expiration time validation passed");
            return null;

        } catch (Exception e) {
            log.error("Error validating expiration time", e);
            return "Error validating expiration time: " + e.getMessage();
        }
    }

    /**
     * Validates JSON format string.
     *
     * @param json the JSON string
     * @return validation error message, or null if valid
     */
    public String validateJson(String json) {
        log.debug("Validating JSON format");

        try {
            if (json == null || json.trim().isEmpty()) {
                return "JSON cannot be null or empty";
            }

            // Basic JSON validation (check for balanced braces)
            int braceCount = 0;
            int bracketCount = 0;

            for (char c : json.toCharArray()) {
                if (c == '{') braceCount++;
                if (c == '}') braceCount--;
                if (c == '[') bracketCount++;
                if (c == ']') bracketCount--;
            }

            if (braceCount != 0) {
                return "JSON has unbalanced curly braces";
            }

            if (bracketCount != 0) {
                return "JSON has unbalanced square brackets";
            }

            log.debug("JSON validation passed");
            return null;

        } catch (Exception e) {
            log.error("Error validating JSON", e);
            return "Error validating JSON: " + e.getMessage();
        }
    }
}

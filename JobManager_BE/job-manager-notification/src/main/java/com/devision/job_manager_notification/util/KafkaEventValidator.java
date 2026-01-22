package com.devision.job_manager_notification.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Utility class for validating Kafka event data with comprehensive logging.
 * Provides reusable validation methods for common event fields.
 */
@Slf4j
@Component
public class KafkaEventValidator {

    private static final String VALIDATION_ERROR_PREFIX = "[VALIDATION_ERROR]";
    private static final String VALIDATION_WARNING_PREFIX = "[VALIDATION_WARNING]";

    /**
     * Validates that a UUID field is not null.
     *
     * @param value the UUID to validate
     * @param fieldName the name of the field being validated
     * @param context additional context for logging (e.g., event type, company ID)
     * @return true if valid, false otherwise
     */
    public boolean validateUuidNotNull(UUID value, String fieldName, String context) {
        if (value == null) {
            log.error("{} Required UUID field '{}' is null. Context: {}",
                    VALIDATION_ERROR_PREFIX, fieldName, context);
            return false;
        }
        log.debug("UUID field '{}' validated successfully: {}", fieldName, value);
        return true;
    }

    /**
     * Validates that a String field is not null or empty.
     *
     * @param value the string to validate
     * @param fieldName the name of the field being validated
     * @param context additional context for logging
     * @return true if valid, false otherwise
     */
    public boolean validateStringNotEmpty(String value, String fieldName, String context) {
        if (value == null) {
            log.error("{} Required string field '{}' is null. Context: {}",
                    VALIDATION_ERROR_PREFIX, fieldName, context);
            return false;
        }
        if (value.trim().isEmpty()) {
            log.error("{} Required string field '{}' is empty. Context: {}",
                    VALIDATION_ERROR_PREFIX, fieldName, context);
            return false;
        }
        log.debug("String field '{}' validated successfully: {}", fieldName, value);
        return true;
    }

    /**
     * Validates that a String field is not null or empty, with warning level.
     *
     * @param value the string to validate
     * @param fieldName the name of the field being validated
     * @param context additional context for logging
     * @return true if valid, false otherwise
     */
    public boolean validateStringNotEmptyWarning(String value, String fieldName, String context) {
        if (value == null || value.trim().isEmpty()) {
            log.warn("{} Optional string field '{}' is null/empty. Context: {}. Using default value.",
                    VALIDATION_WARNING_PREFIX, fieldName, context);
            return false;
        }
        log.debug("Optional string field '{}' validated successfully: {}", fieldName, value);
        return true;
    }

    /**
     * Validates that a numeric amount is positive.
     *
     * @param amount the amount to validate
     * @param fieldName the name of the field being validated
     * @param context additional context for logging
     * @return true if valid, false otherwise
     */
    public boolean validateAmountPositive(Double amount, String fieldName, String context) {
        if (amount == null) {
            log.error("{} Amount field '{}' is null. Context: {}",
                    VALIDATION_ERROR_PREFIX, fieldName, context);
            return false;
        }
        if (amount <= 0) {
            log.error("{} Amount field '{}' is not positive: {}. Context: {}",
                    VALIDATION_ERROR_PREFIX, fieldName, amount, context);
            return false;
        }
        if (amount > 1_000_000) {
            log.warn("{} Amount field '{}' is unusually large: {}. Context: {}. Please verify.",
                    VALIDATION_WARNING_PREFIX, fieldName, amount, context);
        }
        log.debug("Amount field '{}' validated successfully: {}", fieldName, amount);
        return true;
    }

    /**
     * Validates that a numeric amount is positive with warning level.
     *
     * @param amount the amount to validate
     * @param fieldName the name of the field being validated
     * @param context additional context for logging
     * @return true if valid, false otherwise
     */
    public boolean validateAmountPositiveWarning(Double amount, String fieldName, String context) {
        if (amount == null) {
            log.warn("{} Optional amount field '{}' is null. Context: {}",
                    VALIDATION_WARNING_PREFIX, fieldName, context);
            return false;
        }
        if (amount <= 0) {
            log.warn("{} Optional amount field '{}' is not positive: {}. Context: {}",
                    VALIDATION_WARNING_PREFIX, fieldName, amount, context);
            return false;
        }
        log.debug("Optional amount field '{}' validated successfully: {}", fieldName, amount);
        return true;
    }

    /**
     * Validates that a LocalDateTime is not null.
     *
     * @param dateTime the date/time to validate
     * @param fieldName the name of the field being validated
     * @param context additional context for logging
     * @return true if valid, false otherwise
     */
    public boolean validateDateTimeNotNull(LocalDateTime dateTime, String fieldName, String context) {
        if (dateTime == null) {
            log.error("{} Required DateTime field '{}' is null. Context: {}",
                    VALIDATION_ERROR_PREFIX, fieldName, context);
            return false;
        }
        if (dateTime.isAfter(LocalDateTime.now().plusYears(10))) {
            log.warn("{} DateTime field '{}' is unusually far in the future: {}. Context: {}. Please verify.",
                    VALIDATION_WARNING_PREFIX, fieldName, dateTime, context);
        }
        if (dateTime.isBefore(LocalDateTime.now().minusYears(10))) {
            log.warn("{} DateTime field '{}' is unusually far in the past: {}. Context: {}. Please verify.",
                    VALIDATION_WARNING_PREFIX, fieldName, dateTime, context);
        }
        log.debug("DateTime field '{}' validated successfully: {}", fieldName, dateTime);
        return true;
    }

    /**
     * Validates that a LocalDateTime is not null with warning level.
     *
     * @param dateTime the date/time to validate
     * @param fieldName the name of the field being validated
     * @param context additional context for logging
     * @return true if valid, false otherwise
     */
    public boolean validateDateTimeNotNullWarning(LocalDateTime dateTime, String fieldName, String context) {
        if (dateTime == null) {
            log.warn("{} Optional DateTime field '{}' is null. Context: {}",
                    VALIDATION_WARNING_PREFIX, fieldName, context);
            return false;
        }
        log.debug("Optional DateTime field '{}' validated successfully: {}", fieldName, dateTime);
        return true;
    }

    /**
     * Validates that startDate is before endDate.
     *
     * @param startDate the start date
     * @param endDate the end date
     * @param context additional context for logging
     * @return true if valid, false otherwise
     */
    public boolean validateDateRange(LocalDateTime startDate, LocalDateTime endDate, String context) {
        if (startDate == null || endDate == null) {
            log.error("{} Cannot validate date range with null values. StartDate: {}, EndDate: {}. Context: {}",
                    VALIDATION_ERROR_PREFIX, startDate, endDate, context);
            return false;
        }
        if (startDate.isAfter(endDate)) {
            log.error("{} Invalid date range - startDate {} is after endDate {}. Context: {}",
                    VALIDATION_ERROR_PREFIX, startDate, endDate, context);
            return false;
        }
        if (startDate.isEqual(endDate)) {
            log.warn("{} Date range has zero duration - startDate equals endDate: {}. Context: {}",
                    VALIDATION_WARNING_PREFIX, startDate, context);
        }
        log.debug("Date range validated successfully: {} to {}", startDate, endDate);
        return true;
    }

    /**
     * Validates currency code format (ISO 4217).
     *
     * @param currencyCode the currency code to validate
     * @param context additional context for logging
     * @return true if valid, false otherwise
     */
    public boolean validateCurrencyCode(String currencyCode, String context) {
        if (currencyCode == null || currencyCode.trim().isEmpty()) {
            log.warn("{} Currency code is null/empty. Context: {}",
                    VALIDATION_WARNING_PREFIX, context);
            return false;
        }

        String trimmedCode = currencyCode.trim().toUpperCase();

        if (trimmedCode.length() != 3) {
            log.warn("{} Currency code '{}' does not match ISO 4217 format (should be 3 letters). Context: {}",
                    VALIDATION_WARNING_PREFIX, currencyCode, context);
            return false;
        }

        if (!trimmedCode.matches("[A-Z]{3}")) {
            log.warn("{} Currency code '{}' contains non-alphabetic characters. Context: {}",
                    VALIDATION_WARNING_PREFIX, currencyCode, context);
            return false;
        }

        // Validate against common currency codes
        String[] commonCurrencies = {"USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "SEK", "NZD"};
        boolean isCommon = false;
        for (String common : commonCurrencies) {
            if (common.equals(trimmedCode)) {
                isCommon = true;
                break;
            }
        }

        if (!isCommon) {
            log.debug("Currency code '{}' is valid but not commonly used. Context: {}", currencyCode, context);
        } else {
            log.debug("Currency code '{}' validated successfully", currencyCode);
        }

        return true;
    }

    /**
     * Validates an integer field is within a specified range.
     *
     * @param value the value to validate
     * @param fieldName the name of the field
     * @param min minimum allowed value (inclusive)
     * @param max maximum allowed value (inclusive)
     * @param context additional context for logging
     * @return true if valid, false otherwise
     */
    public boolean validateIntegerRange(Integer value, String fieldName, int min, int max, String context) {
        if (value == null) {
            log.error("{} Integer field '{}' is null. Context: {}",
                    VALIDATION_ERROR_PREFIX, fieldName, context);
            return false;
        }
        if (value < min || value > max) {
            log.error("{} Integer field '{}' value {} is out of range [{}, {}]. Context: {}",
                    VALIDATION_ERROR_PREFIX, fieldName, value, min, max, context);
            return false;
        }
        log.debug("Integer field '{}' validated successfully: {} (range: {}-{})",
                fieldName, value, min, max);
        return true;
    }

    /**
     * Validates a boolean field is not null.
     *
     * @param value the boolean to validate
     * @param fieldName the name of the field
     * @param context additional context for logging
     * @return true if valid, false otherwise
     */
    public boolean validateBooleanNotNull(Boolean value, String fieldName, String context) {
        if (value == null) {
            log.warn("{} Boolean field '{}' is null. Context: {}. Assuming false.",
                    VALIDATION_WARNING_PREFIX, fieldName, context);
            return false;
        }
        log.debug("Boolean field '{}' validated successfully: {}", fieldName, value);
        return true;
    }

    /**
     * Logs validation summary for an event.
     *
     * @param eventType the type of event being validated
     * @param isValid whether the overall validation passed
     * @param validationErrors list of validation errors encountered
     */
    public void logValidationSummary(String eventType, boolean isValid, String... validationErrors) {
        if (isValid) {
            log.info("Validation PASSED for event type: {}", eventType);
        } else {
            log.error("Validation FAILED for event type: {}. Errors: {}", eventType,
                    validationErrors.length > 0 ? String.join(", ", validationErrors) : "See above logs");
        }
    }

    /**
     * Sanitizes a string to prevent log injection attacks.
     *
     * @param input the string to sanitize
     * @return sanitized string safe for logging
     */
    public String sanitizeForLogging(String input) {
        if (input == null) {
            return "null";
        }

        // Remove newlines and carriage returns to prevent log injection
        String sanitized = input.replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");

        // Truncate if too long
        if (sanitized.length() > 500) {
            sanitized = sanitized.substring(0, 497) + "...";
            log.debug("String truncated for logging (original length: {})", input.length());
        }

        return sanitized;
    }
}

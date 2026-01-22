package com.devision.job_manager_notification.listener;

import com.devision.job_manager_notification.dto.internal.InternalCreateNotificationRequest;
import com.devision.job_manager_notification.enums.NotificationType;
import com.devision.job_manager_notification.event.PaymentCompletedEvent;
import com.devision.job_manager_notification.event.PaymentFailedEvent;
import com.devision.job_manager_notification.service.InternalNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventListener {

    private final InternalNotificationService internalNotificationService;

    @KafkaListener(
            topics = "payment.completed",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        try {
            log.info("Received PaymentCompletedEvent for payment: {} (company: {})",
                    event.getPaymentId(), event.getCompanyId());

            // Validate event data
            if (event == null) {
                log.error("Received null PaymentCompletedEvent - skipping processing");
                return;
            }

            if (event.getPaymentId() == null) {
                log.error("PaymentCompletedEvent has null paymentId - skipping processing");
                return;
            }

            if (event.getCompanyId() == null) {
                log.error("PaymentCompletedEvent has null companyId for payment: {} - skipping processing",
                    event.getPaymentId());
                return;
            }

            // Validate payment amount
            if (event.getAmount() == null || event.getAmount() <= 0) {
                log.warn("Invalid payment amount for payment: {}. Amount: {}",
                    event.getPaymentId(), event.getAmount());
            }

            // Validate currency
            if (event.getCurrency() == null || event.getCurrency().trim().isEmpty()) {
                log.warn("Missing currency for payment: {} - using 'N/A'", event.getPaymentId());
            }

            log.debug("Processing payment completion - ID: {}, Amount: {} {}, Method: {}, Transaction: {}",
                event.getPaymentId(), event.getAmount(), event.getCurrency(),
                event.getPaymentMethod(), event.getTransactionId());

            // Build notification message with null-safety
            String message = buildPaymentCompletedMessage(event);

            // Create notification request with validation
            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(event.getCompanyId())
                    .type(NotificationType.SYSTEM)
                    .title("Payment Successful")
                    .message(message)
                    .referenceId(event.getPaymentId().toString())
                    .referenceType("PAYMENT_COMPLETED")
                    .metadata(buildPaymentMetadata(event))
                    .build();

            // Create notification in database
            try {
                internalNotificationService.createNotification(notification);
                log.info("Successfully created notification for payment completion: {} (company: {})",
                    event.getPaymentId(), event.getCompanyId());
            } catch (Exception notifEx) {
                log.error("Failed to create notification for payment: {}. Error: {}",
                    event.getPaymentId(), notifEx.getMessage(), notifEx);
                // Rethrow to trigger Kafka retry if configured
                throw notifEx;
            }

        } catch (NullPointerException e) {
            log.error("Null pointer exception processing PaymentCompletedEvent for payment: {}. Error: {}",
                    event != null ? event.getPaymentId() : "unknown", e.getMessage(), e);
        } catch (IllegalArgumentException e) {
            log.error("Invalid argument while processing PaymentCompletedEvent for payment: {}. Error: {}",
                    event != null ? event.getPaymentId() : "unknown", e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error processing PaymentCompletedEvent for payment: {}. Error: {}",
                    event != null ? event.getPaymentId() : "unknown", e.getMessage(), e);
            // Consider implementing dead letter queue here
        }
    }

    @KafkaListener(
            topics = "payment.failed",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handlePaymentFailed(PaymentFailedEvent event) {
        try {
            log.info("Received PaymentFailedEvent for payment: {} (company: {})",
                    event.getPaymentId(), event.getCompanyId());

            // Validate event data
            if (event == null) {
                log.error("Received null PaymentFailedEvent - skipping processing");
                return;
            }

            if (event.getPaymentId() == null) {
                log.error("PaymentFailedEvent has null paymentId - skipping processing");
                return;
            }

            if (event.getCompanyId() == null) {
                log.error("PaymentFailedEvent has null companyId for payment: {} - skipping processing",
                    event.getPaymentId());
                return;
            }

            // Validate payment amount
            if (event.getAmount() == null || event.getAmount() <= 0) {
                log.warn("Invalid payment amount for failed payment: {}. Amount: {}",
                    event.getPaymentId(), event.getAmount());
            }

            // Validate currency
            if (event.getCurrency() == null || event.getCurrency().trim().isEmpty()) {
                log.warn("Missing currency for failed payment: {} - using 'N/A'", event.getPaymentId());
            }

            // Validate failure reason
            if (event.getFailureReason() == null || event.getFailureReason().trim().isEmpty()) {
                log.warn("Missing failure reason for payment: {} - using generic message", event.getPaymentId());
            }

            log.debug("Processing payment failure - ID: {}, Amount: {} {}, Reason: {}, Error Code: {}",
                event.getPaymentId(), event.getAmount(), event.getCurrency(),
                event.getFailureReason(), event.getErrorCode());

            // Build notification message with null-safety
            String message = buildPaymentFailedMessage(event);

            // Create notification request with validation
            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(event.getCompanyId())
                    .type(NotificationType.ALERT)
                    .title("Payment Failed")
                    .message(message)
                    .referenceId(event.getPaymentId().toString())
                    .referenceType("PAYMENT_FAILED")
                    .metadata(buildPaymentFailureMetadata(event))
                    .build();

            // Create notification in database
            try {
                internalNotificationService.createNotification(notification);
                log.info("Successfully created notification for payment failure: {} (company: {})",
                    event.getPaymentId(), event.getCompanyId());

                // Log additional details for monitoring
                log.warn("Payment failure notification sent - Payment: {}, Company: {}, Reason: {}, Error Code: {}",
                    event.getPaymentId(), event.getCompanyId(),
                    event.getFailureReason(), event.getErrorCode());

            } catch (Exception notifEx) {
                log.error("Failed to create notification for failed payment: {}. Error: {}",
                    event.getPaymentId(), notifEx.getMessage(), notifEx);
                // Rethrow to trigger Kafka retry if configured
                throw notifEx;
            }

        } catch (NullPointerException e) {
            log.error("Null pointer exception processing PaymentFailedEvent for payment: {}. Error: {}",
                    event != null ? event.getPaymentId() : "unknown", e.getMessage(), e);
        } catch (IllegalArgumentException e) {
            log.error("Invalid argument while processing PaymentFailedEvent for payment: {}. Error: {}",
                    event != null ? event.getPaymentId() : "unknown", e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error processing PaymentFailedEvent for payment: {}. Error: {}",
                    event != null ? event.getPaymentId() : "unknown", e.getMessage(), e);
            // Consider implementing dead letter queue here
        }
    }

    // ==================== Helper Methods ====================

    /**
     * Builds a user-friendly payment completion message with null-safety
     */
    private String buildPaymentCompletedMessage(PaymentCompletedEvent event) {
        try {
            Double amount = event.getAmount() != null ? event.getAmount() : 0.0;
            String currency = (event.getCurrency() != null && !event.getCurrency().trim().isEmpty())
                ? event.getCurrency() : "N/A";
            String transactionId = (event.getTransactionId() != null && !event.getTransactionId().trim().isEmpty())
                ? event.getTransactionId() : "N/A";

            String message = String.format(
                "Your payment of %.2f %s has been successfully processed. Transaction ID: %s",
                amount, currency, transactionId
            );

            log.debug("Built payment completion message for payment: {}", event.getPaymentId());
            return message;

        } catch (Exception e) {
            log.error("Error building payment completion message for payment: {}. Using fallback message. Error: {}",
                event.getPaymentId(), e.getMessage(), e);
            return "Your payment has been successfully processed.";
        }
    }

    /**
     * Builds a user-friendly payment failure message with null-safety
     */
    private String buildPaymentFailedMessage(PaymentFailedEvent event) {
        try {
            Double amount = event.getAmount() != null ? event.getAmount() : 0.0;
            String currency = (event.getCurrency() != null && !event.getCurrency().trim().isEmpty())
                ? event.getCurrency() : "N/A";
            String failureReason = (event.getFailureReason() != null && !event.getFailureReason().trim().isEmpty())
                ? event.getFailureReason() : "Unknown reason";

            String message = String.format(
                "Payment of %.2f %s failed. Reason: %s. Please check your payment method and try again.",
                amount, currency, failureReason
            );

            log.debug("Built payment failure message for payment: {}", event.getPaymentId());
            return message;

        } catch (Exception e) {
            log.error("Error building payment failure message for payment: {}. Using fallback message. Error: {}",
                event.getPaymentId(), e.getMessage(), e);
            return "Your payment failed. Please check your payment method and try again.";
        }
    }

    /**
     * Builds JSON metadata for payment completion event with null-safety
     */
    private String buildPaymentMetadata(PaymentCompletedEvent event) {
        try {
            // Validate and provide defaults for all fields
            String paymentId = event.getPaymentId() != null ? event.getPaymentId().toString() : "unknown";
            Double amount = event.getAmount() != null ? event.getAmount() : 0.0;
            String currency = (event.getCurrency() != null && !event.getCurrency().trim().isEmpty())
                ? sanitizeJsonString(event.getCurrency()) : "N/A";
            String method = (event.getPaymentMethod() != null && !event.getPaymentMethod().trim().isEmpty())
                ? sanitizeJsonString(event.getPaymentMethod()) : "N/A";
            String transactionId = (event.getTransactionId() != null && !event.getTransactionId().trim().isEmpty())
                ? sanitizeJsonString(event.getTransactionId()) : "N/A";
            String completedAt = event.getCompletedAt() != null ? event.getCompletedAt().toString() : "N/A";

            String metadata = String.format(
                "{\"paymentId\":\"%s\",\"amount\":%.2f,\"currency\":\"%s\",\"method\":\"%s\",\"transactionId\":\"%s\",\"completedAt\":\"%s\"}",
                paymentId, amount, currency, method, transactionId, completedAt
            );

            log.debug("Built payment metadata for payment: {} - Length: {} characters",
                event.getPaymentId(), metadata.length());

            return metadata;

        } catch (Exception e) {
            log.error("Error building payment metadata for payment: {}. Using minimal metadata. Error: {}",
                event.getPaymentId(), e.getMessage(), e);
            return String.format("{\"paymentId\":\"%s\",\"error\":\"Failed to build complete metadata\"}",
                event.getPaymentId() != null ? event.getPaymentId().toString() : "unknown");
        }
    }

    /**
     * Builds JSON metadata for payment failure event with null-safety
     */
    private String buildPaymentFailureMetadata(PaymentFailedEvent event) {
        try {
            // Validate and provide defaults for all fields
            String paymentId = event.getPaymentId() != null ? event.getPaymentId().toString() : "unknown";
            Double amount = event.getAmount() != null ? event.getAmount() : 0.0;
            String currency = (event.getCurrency() != null && !event.getCurrency().trim().isEmpty())
                ? sanitizeJsonString(event.getCurrency()) : "N/A";
            String failureReason = (event.getFailureReason() != null && !event.getFailureReason().trim().isEmpty())
                ? sanitizeJsonString(event.getFailureReason()) : "Unknown reason";
            String errorCode = (event.getErrorCode() != null && !event.getErrorCode().trim().isEmpty())
                ? sanitizeJsonString(event.getErrorCode()) : "N/A";
            String failedAt = event.getFailedAt() != null ? event.getFailedAt().toString() : "N/A";

            String metadata = String.format(
                "{\"paymentId\":\"%s\",\"amount\":%.2f,\"currency\":\"%s\",\"failureReason\":\"%s\",\"errorCode\":\"%s\",\"failedAt\":\"%s\"}",
                paymentId, amount, currency, failureReason, errorCode, failedAt
            );

            log.debug("Built payment failure metadata for payment: {} - Length: {} characters",
                event.getPaymentId(), metadata.length());

            return metadata;

        } catch (Exception e) {
            log.error("Error building payment failure metadata for payment: {}. Using minimal metadata. Error: {}",
                event.getPaymentId(), e.getMessage(), e);
            return String.format("{\"paymentId\":\"%s\",\"error\":\"Failed to build complete metadata\"}",
                event.getPaymentId() != null ? event.getPaymentId().toString() : "unknown");
        }
    }

    @KafkaListener(
            topics = "payment.cancelled",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handlePaymentCancelled(java.util.Map<String, Object> payload) {
        try {
            java.util.UUID paymentId = parseUUID(payload.get("paymentId"));
            java.util.UUID companyId = parseUUID(payload.get("payerId"));
            Double amount = payload.get("amount") != null ? ((Number) payload.get("amount")).doubleValue() : 0.0;
            String currency = (String) payload.getOrDefault("currency", "USD");

            log.info("Received payment.cancelled event for payment: {} (company: {})", paymentId, companyId);

            if (paymentId == null || companyId == null) {
                log.error("Payment cancelled event has null paymentId or companyId, skipping");
                return;
            }

            String message = String.format("Your payment of %.2f %s has been cancelled. " +
                    "No charges were made to your account.",
                    amount, currency);

            String metadata = String.format("{\"paymentId\":\"%s\",\"amount\":%.2f,\"currency\":\"%s\",\"cancelledAt\":\"%s\"}",
                    paymentId, amount, currency, java.time.LocalDateTime.now());

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(companyId)
                    .type(NotificationType.SYSTEM)
                    .title("Payment Cancelled")
                    .message(message)
                    .referenceId(paymentId.toString())
                    .referenceType("PAYMENT_CANCELLED")
                    .metadata(metadata)
                    .build();

            internalNotificationService.createNotification(notification);
            log.info("Successfully created notification for payment cancellation: {} (company: {})", paymentId, companyId);

        } catch (Exception e) {
            log.error("Error processing payment.cancelled event: {}", e.getMessage(), e);
        }
    }

    private java.util.UUID parseUUID(Object value) {
        if (value == null) return null;
        if (value instanceof java.util.UUID) return (java.util.UUID) value;
        if (value instanceof String) {
            try {
                return java.util.UUID.fromString((String) value);
            } catch (IllegalArgumentException e) {
                log.warn("Failed to parse UUID from string: {}", value);
                return null;
            }
        }
        return null;
    }

    /**
     * Sanitizes strings for safe JSON inclusion by escaping special characters
     */
    private String sanitizeJsonString(String input) {
        if (input == null) {
            return "";
        }

        try {
            // Escape special JSON characters
            String sanitized = input
                .replace("\\", "\\\\")  // Escape backslashes first
                .replace("\"", "\\\"")  // Escape quotes
                .replace("\n", "\\n")   // Escape newlines
                .replace("\r", "\\r")   // Escape carriage returns
                .replace("\t", "\\t");  // Escape tabs

            // Limit length to prevent excessive metadata size
            if (sanitized.length() > 500) {
                log.warn("Truncating overly long string in metadata: {} characters", sanitized.length());
                sanitized = sanitized.substring(0, 497) + "...";
            }

            return sanitized;

        } catch (Exception e) {
            log.error("Error sanitizing JSON string. Using safe default. Error: {}", e.getMessage());
            return "sanitization_error";
        }
    }
}

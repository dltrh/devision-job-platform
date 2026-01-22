package com.devision.job_manager_subscription.kafka;

import com.devision.job_manager_subscription.event.SubscriptionUpdatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionEventProducer {

    private static final String TOPIC_SUBSCRIPTION_UPDATED = "company.subscription.updated";
    private static final String TOPIC_SUBSCRIPTION_CREATED = "subscription.created";
    private static final String TOPIC_SUBSCRIPTION_RENEWED = "subscription.renewed";
    private static final String TOPIC_SUBSCRIPTION_EXPIRED = "subscription.expired";
    private static final String TOPIC_SUBSCRIPTION_CANCELLED = "subscription.cancelled";
    private static final String TOPIC_SUBSCRIPTION_EXPIRING_SOON = "subscription.expiring-soon";

    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final long KAFKA_TIMEOUT_SECONDS = 10;
    private static final String DEFAULT_PLAN_TYPE = "PREMIUM";
    private static final String DEFAULT_CURRENCY = "USD";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishSubscriptionUpdated(SubscriptionUpdatedEvent event) {
        try {
            log.info("Publishing subscription updated event for company: {}", event.getCompanyId());

            // Validate event
            if (event == null) {
                log.error("Cannot publish null SubscriptionUpdatedEvent");
                throw new IllegalArgumentException("SubscriptionUpdatedEvent cannot be null");
            }

            if (event.getCompanyId() == null) {
                log.error("Cannot publish SubscriptionUpdatedEvent with null companyId");
                throw new IllegalArgumentException("CompanyId cannot be null");
            }

            // Send to Kafka with callback
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                TOPIC_SUBSCRIPTION_UPDATED,
                event.getCompanyId().toString(),
                event
            );

            // Add success and failure callbacks
            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish subscription updated event for company: {}. Error: {}",
                        event.getCompanyId(), ex.getMessage(), ex);
                    handlePublishFailure(TOPIC_SUBSCRIPTION_UPDATED, event.getCompanyId(), ex);
                } else {
                    log.info("Successfully published subscription updated event for company: {} to partition: {} with offset: {}",
                        event.getCompanyId(),
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
                }
            });

        } catch (IllegalArgumentException e) {
            log.error("Validation error publishing subscription updated event: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error publishing subscription updated event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to publish subscription updated event", e);
        }
    }

    public void publishSubscriptionCreated(UUID subscriptionId, UUID companyId, String planType,
                                          LocalDateTime startAt, LocalDateTime endAt, String paymentReferenceId) {
        try {
            log.info("Publishing subscription created event for company: {}", companyId);

            // Validate input parameters
            validateSubscriptionId(subscriptionId);
            validateCompanyId(companyId);
            validatePlanType(planType);
            validateStartEndDates(startAt, endAt);

            // Build event with validation
            SubscriptionCreatedEventDTO event = buildSubscriptionCreatedEvent(
                subscriptionId, companyId, planType, startAt, endAt, paymentReferenceId
            );

            // Send to Kafka with callback
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                TOPIC_SUBSCRIPTION_CREATED,
                companyId.toString(),
                event
            );

            // Add success and failure callbacks
            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish subscription created event for subscription: {}, company: {}. Error: {}",
                        subscriptionId, companyId, ex.getMessage(), ex);
                    handlePublishFailure(TOPIC_SUBSCRIPTION_CREATED, companyId, ex);
                } else {
                    log.info("Successfully published subscription created event for subscription: {}, company: {} to partition: {} with offset: {}",
                        subscriptionId, companyId,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
                    log.debug("Event details - planType: {}, startAt: {}, endAt: {}", planType, startAt, endAt);
                }
            });

        } catch (IllegalArgumentException e) {
            log.error("Validation error publishing subscription created event: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error publishing subscription created event for subscription: {}, company: {}. Error: {}",
                subscriptionId, companyId, e.getMessage(), e);
            throw new RuntimeException("Failed to publish subscription created event", e);
        }
    }

    public void publishSubscriptionRenewed(UUID subscriptionId, UUID companyId, String planType,
                                          LocalDateTime previousEndAt, LocalDateTime newEndAt,
                                          String paymentReferenceId, Double renewalAmount, String currency) {
        try {
            log.info("Publishing subscription renewed event for company: {}", companyId);

            // Validate input parameters
            validateSubscriptionId(subscriptionId);
            validateCompanyId(companyId);
            validatePlanType(planType);
            validateRenewalDates(previousEndAt, newEndAt);
            validateRenewalAmount(renewalAmount);
            validateCurrency(currency);

            // Build event with validation
            SubscriptionRenewedEventDTO event = buildSubscriptionRenewedEvent(
                subscriptionId, companyId, planType, previousEndAt, newEndAt,
                paymentReferenceId, renewalAmount, currency
            );

            // Send to Kafka with callback
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                TOPIC_SUBSCRIPTION_RENEWED,
                companyId.toString(),
                event
            );

            // Add success and failure callbacks
            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish subscription renewed event for subscription: {}, company: {}. Error: {}",
                        subscriptionId, companyId, ex.getMessage(), ex);
                    handlePublishFailure(TOPIC_SUBSCRIPTION_RENEWED, companyId, ex);
                } else {
                    log.info("Successfully published subscription renewed event for subscription: {}, company: {} to partition: {} with offset: {}",
                        subscriptionId, companyId,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
                    log.debug("Renewal details - amount: {} {}, previous end: {}, new end: {}",
                        renewalAmount, currency, previousEndAt, newEndAt);
                }
            });

        } catch (IllegalArgumentException e) {
            log.error("Validation error publishing subscription renewed event: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error publishing subscription renewed event for subscription: {}, company: {}. Error: {}",
                subscriptionId, companyId, e.getMessage(), e);
            throw new RuntimeException("Failed to publish subscription renewed event", e);
        }
    }

    public void publishSubscriptionExpired(UUID subscriptionId, UUID companyId, String planType,
                                          LocalDateTime subscriptionStartAt, LocalDateTime expiredAt,
                                          String expirationReason) {
        try {
            log.info("Publishing subscription expired event for company: {}", companyId);

            // Validate input parameters
            validateSubscriptionId(subscriptionId);
            validateCompanyId(companyId);
            validatePlanType(planType);
            validateExpirationDates(subscriptionStartAt, expiredAt);
            validateExpirationReason(expirationReason);

            // Build event with validation
            SubscriptionExpiredEventDTO event = buildSubscriptionExpiredEvent(
                subscriptionId, companyId, planType, subscriptionStartAt, expiredAt, expirationReason
            );

            // Send to Kafka with callback
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                TOPIC_SUBSCRIPTION_EXPIRED,
                companyId.toString(),
                event
            );

            // Add success and failure callbacks
            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish subscription expired event for subscription: {}, company: {}. Error: {}",
                        subscriptionId, companyId, ex.getMessage(), ex);
                    handlePublishFailure(TOPIC_SUBSCRIPTION_EXPIRED, companyId, ex);
                } else {
                    log.info("Successfully published subscription expired event for subscription: {}, company: {} to partition: {} with offset: {}",
                        subscriptionId, companyId,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
                    log.debug("Expiration details - reason: {}, expired at: {}", expirationReason, expiredAt);
                }
            });

        } catch (IllegalArgumentException e) {
            log.error("Validation error publishing subscription expired event: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error publishing subscription expired event for subscription: {}, company: {}. Error: {}",
                subscriptionId, companyId, e.getMessage(), e);
            throw new RuntimeException("Failed to publish subscription expired event", e);
        }
    }

    public void publishSubscriptionCancelled(UUID subscriptionId, UUID companyId, String planType,
                                            LocalDateTime subscriptionStartAt, LocalDateTime cancelledAt,
                                            LocalDateTime accessEndsAt, String cancellationReason) {
        try {
            log.info("Publishing subscription cancelled event for company: {}", companyId);

            // Validate input parameters
            validateSubscriptionId(subscriptionId);
            validateCompanyId(companyId);
            validatePlanType(planType);
            validateCancellationDates(subscriptionStartAt, cancelledAt, accessEndsAt);
            validateCancellationReason(cancellationReason);

            // Build event with validation
            SubscriptionCancelledEventDTO event = buildSubscriptionCancelledEvent(
                subscriptionId, companyId, planType, subscriptionStartAt,
                cancelledAt, accessEndsAt, cancellationReason
            );

            // Send to Kafka with callback
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                TOPIC_SUBSCRIPTION_CANCELLED,
                companyId.toString(),
                event
            );

            // Add success and failure callbacks
            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish subscription cancelled event for subscription: {}, company: {}. Error: {}",
                        subscriptionId, companyId, ex.getMessage(), ex);
                    handlePublishFailure(TOPIC_SUBSCRIPTION_CANCELLED, companyId, ex);
                } else {
                    log.info("Successfully published subscription cancelled event for subscription: {}, company: {} to partition: {} with offset: {}",
                        subscriptionId, companyId,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
                    log.debug("Cancellation details - reason: {}, access ends: {}", cancellationReason, accessEndsAt);
                }
            });

        } catch (IllegalArgumentException e) {
            log.error("Validation error publishing subscription cancelled event: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error publishing subscription cancelled event for subscription: {}, company: {}. Error: {}",
                subscriptionId, companyId, e.getMessage(), e);
            throw new RuntimeException("Failed to publish subscription cancelled event", e);
        }
    }

    public void publishSubscriptionExpiringSoon(UUID subscriptionId, UUID companyId, String planType,
                                               LocalDateTime expiresAt, int daysRemaining) {
        try {
            log.info("Publishing subscription expiring soon event for company: {} ({} days remaining)",
                    companyId, daysRemaining);

            // Validate input parameters
            validateSubscriptionId(subscriptionId);
            validateCompanyId(companyId);
            validatePlanType(planType);
            validateExpiresAt(expiresAt);
            validateDaysRemaining(daysRemaining);

            // Build event with validation
            SubscriptionExpiringSoonEventDTO event = buildSubscriptionExpiringSoonEvent(
                subscriptionId, companyId, planType, expiresAt, daysRemaining
            );

            // Send to Kafka with callback
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                TOPIC_SUBSCRIPTION_EXPIRING_SOON,
                companyId.toString(),
                event
            );

            // Add success and failure callbacks
            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish subscription expiring soon event for subscription: {}, company: {}. Error: {}",
                        subscriptionId, companyId, ex.getMessage(), ex);
                    handlePublishFailure(TOPIC_SUBSCRIPTION_EXPIRING_SOON, companyId, ex);
                } else {
                    log.info("Successfully published subscription expiring soon event for subscription: {}, company: {} to partition: {} with offset: {}",
                        subscriptionId, companyId,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
                    log.debug("Expiration warning details - days remaining: {}, expires at: {}", daysRemaining, expiresAt);
                }
            });

        } catch (IllegalArgumentException e) {
            log.error("Validation error publishing subscription expiring soon event: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error publishing subscription expiring soon event for subscription: {}, company: {}. Error: {}",
                subscriptionId, companyId, e.getMessage(), e);
            throw new RuntimeException("Failed to publish subscription expiring soon event", e);
        }
    }

    // ==================== Validation Methods ====================

    private void validateSubscriptionId(UUID subscriptionId) {
        if (subscriptionId == null) {
            log.error("Subscription ID cannot be null");
            throw new IllegalArgumentException("Subscription ID cannot be null");
        }
        log.debug("Validated subscription ID: {}", subscriptionId);
    }

    private void validateCompanyId(UUID companyId) {
        if (companyId == null) {
            log.error("Company ID cannot be null");
            throw new IllegalArgumentException("Company ID cannot be null");
        }
        log.debug("Validated company ID: {}", companyId);
    }

    private void validatePlanType(String planType) {
        if (planType == null || planType.trim().isEmpty()) {
            log.error("Plan type cannot be null or empty");
            throw new IllegalArgumentException("Plan type cannot be null or empty");
        }
        if (planType.length() > 50) {
            log.error("Plan type exceeds maximum length: {}", planType.length());
            throw new IllegalArgumentException("Plan type exceeds maximum length of 50 characters");
        }
        log.debug("Validated plan type: {}", planType);
    }

    private void validateStartEndDates(LocalDateTime startAt, LocalDateTime endAt) {
        if (startAt == null) {
            log.error("Start date cannot be null");
            throw new IllegalArgumentException("Start date cannot be null");
        }
        if (endAt == null) {
            log.warn("End date is null - subscription may be lifetime/unlimited");
            return;
        }
        if (endAt.isBefore(startAt)) {
            log.error("End date {} is before start date {}", endAt, startAt);
            throw new IllegalArgumentException("End date cannot be before start date");
        }
        log.debug("Validated start/end dates - start: {}, end: {}", startAt, endAt);
    }

    private void validateRenewalDates(LocalDateTime previousEndAt, LocalDateTime newEndAt) {
        if (previousEndAt == null) {
            log.error("Previous end date cannot be null");
            throw new IllegalArgumentException("Previous end date cannot be null");
        }
        if (newEndAt == null) {
            log.error("New end date cannot be null");
            throw new IllegalArgumentException("New end date cannot be null");
        }
        if (newEndAt.isBefore(previousEndAt)) {
            log.error("New end date {} is before previous end date {}", newEndAt, previousEndAt);
            throw new IllegalArgumentException("New end date must be after previous end date");
        }
        if (newEndAt.equals(previousEndAt)) {
            log.warn("New end date is the same as previous end date: {}", newEndAt);
        }
        log.debug("Validated renewal dates - previous: {}, new: {}", previousEndAt, newEndAt);
    }

    private void validateRenewalAmount(Double renewalAmount) {
        if (renewalAmount == null) {
            log.error("Renewal amount cannot be null");
            throw new IllegalArgumentException("Renewal amount cannot be null");
        }
        if (renewalAmount < 0) {
            log.error("Renewal amount cannot be negative: {}", renewalAmount);
            throw new IllegalArgumentException("Renewal amount cannot be negative");
        }
        if (renewalAmount == 0) {
            log.warn("Renewal amount is zero - free renewal");
        }
        log.debug("Validated renewal amount: {}", renewalAmount);
    }

    private void validateCurrency(String currency) {
        if (currency == null || currency.trim().isEmpty()) {
            log.error("Currency cannot be null or empty");
            throw new IllegalArgumentException("Currency cannot be null or empty");
        }
        if (currency.length() != 3) {
            log.error("Invalid currency code length: {}. Expected 3 characters (ISO 4217)", currency);
            throw new IllegalArgumentException("Currency code must be 3 characters (ISO 4217 format)");
        }
        log.debug("Validated currency: {}", currency);
    }

    private void validateExpirationDates(LocalDateTime subscriptionStartAt, LocalDateTime expiredAt) {
        if (subscriptionStartAt == null) {
            log.error("Subscription start date cannot be null");
            throw new IllegalArgumentException("Subscription start date cannot be null");
        }
        if (expiredAt == null) {
            log.error("Expiration date cannot be null");
            throw new IllegalArgumentException("Expiration date cannot be null");
        }
        if (expiredAt.isBefore(subscriptionStartAt)) {
            log.error("Expiration date {} is before subscription start date {}", expiredAt, subscriptionStartAt);
            throw new IllegalArgumentException("Expiration date cannot be before subscription start date");
        }
        log.debug("Validated expiration dates - start: {}, expired: {}", subscriptionStartAt, expiredAt);
    }

    private void validateExpirationReason(String expirationReason) {
        if (expirationReason == null || expirationReason.trim().isEmpty()) {
            log.warn("Expiration reason is null or empty - using default");
            return;
        }
        if (expirationReason.length() > 200) {
            log.error("Expiration reason exceeds maximum length: {}", expirationReason.length());
            throw new IllegalArgumentException("Expiration reason exceeds maximum length of 200 characters");
        }
        log.debug("Validated expiration reason: {}", expirationReason);
    }

    private void validateCancellationDates(LocalDateTime subscriptionStartAt, LocalDateTime cancelledAt, LocalDateTime accessEndsAt) {
        if (subscriptionStartAt == null) {
            log.error("Subscription start date cannot be null");
            throw new IllegalArgumentException("Subscription start date cannot be null");
        }
        if (cancelledAt == null) {
            log.error("Cancellation date cannot be null");
            throw new IllegalArgumentException("Cancellation date cannot be null");
        }
        if (cancelledAt.isBefore(subscriptionStartAt)) {
            log.error("Cancellation date {} is before subscription start date {}", cancelledAt, subscriptionStartAt);
            throw new IllegalArgumentException("Cancellation date cannot be before subscription start date");
        }
        if (accessEndsAt != null && accessEndsAt.isBefore(cancelledAt)) {
            log.error("Access end date {} is before cancellation date {}", accessEndsAt, cancelledAt);
            throw new IllegalArgumentException("Access end date cannot be before cancellation date");
        }
        log.debug("Validated cancellation dates - start: {}, cancelled: {}, access ends: {}",
            subscriptionStartAt, cancelledAt, accessEndsAt);
    }

    private void validateCancellationReason(String cancellationReason) {
        if (cancellationReason == null || cancellationReason.trim().isEmpty()) {
            log.warn("Cancellation reason is null or empty - using default");
            return;
        }
        if (cancellationReason.length() > 500) {
            log.error("Cancellation reason exceeds maximum length: {}", cancellationReason.length());
            throw new IllegalArgumentException("Cancellation reason exceeds maximum length of 500 characters");
        }
        log.debug("Validated cancellation reason: {}", cancellationReason);
    }

    private void validateExpiresAt(LocalDateTime expiresAt) {
        if (expiresAt == null) {
            log.error("Expiration date cannot be null");
            throw new IllegalArgumentException("Expiration date cannot be null");
        }
        LocalDateTime now = LocalDateTime.now();
        if (expiresAt.isBefore(now)) {
            log.warn("Expiration date {} is in the past (current time: {})", expiresAt, now);
        }
        log.debug("Validated expiration date: {}", expiresAt);
    }

    private void validateDaysRemaining(int daysRemaining) {
        if (daysRemaining < 0) {
            log.error("Days remaining cannot be negative: {}", daysRemaining);
            throw new IllegalArgumentException("Days remaining cannot be negative");
        }
        if (daysRemaining == 0) {
            log.warn("Days remaining is zero - subscription expires today");
        }
        if (daysRemaining > 365) {
            log.warn("Days remaining exceeds 1 year: {}", daysRemaining);
        }
        log.debug("Validated days remaining: {}", daysRemaining);
    }

    // ==================== Event Builder Methods ====================

    private SubscriptionCreatedEventDTO buildSubscriptionCreatedEvent(
            UUID subscriptionId, UUID companyId, String planType,
            LocalDateTime startAt, LocalDateTime endAt, String paymentReferenceId) {
        try {
            SubscriptionCreatedEventDTO event = SubscriptionCreatedEventDTO.builder()
                    .subscriptionId(subscriptionId)
                    .companyId(companyId)
                    .planType(planType)
                    .startAt(startAt)
                    .endAt(endAt)
                    .paymentReferenceId(paymentReferenceId)
                    .eventTimestamp(LocalDateTime.now())
                    .eventSource("subscription-service")
                    .build();
            log.debug("Built SubscriptionCreatedEvent: {}", event);
            return event;
        } catch (Exception e) {
            log.error("Error building SubscriptionCreatedEvent: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to build subscription created event", e);
        }
    }

    private SubscriptionRenewedEventDTO buildSubscriptionRenewedEvent(
            UUID subscriptionId, UUID companyId, String planType,
            LocalDateTime previousEndAt, LocalDateTime newEndAt,
            String paymentReferenceId, Double renewalAmount, String currency) {
        try {
            SubscriptionRenewedEventDTO event = SubscriptionRenewedEventDTO.builder()
                    .subscriptionId(subscriptionId)
                    .companyId(companyId)
                    .planType(planType)
                    .previousEndAt(previousEndAt)
                    .newEndAt(newEndAt)
                    .paymentReferenceId(paymentReferenceId)
                    .renewalAmount(renewalAmount)
                    .currency(currency)
                    .renewalTimestamp(LocalDateTime.now())
                    .eventTimestamp(LocalDateTime.now())
                    .eventSource("subscription-service")
                    .build();
            log.debug("Built SubscriptionRenewedEvent: {}", event);
            return event;
        } catch (Exception e) {
            log.error("Error building SubscriptionRenewedEvent: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to build subscription renewed event", e);
        }
    }

    private SubscriptionExpiredEventDTO buildSubscriptionExpiredEvent(
            UUID subscriptionId, UUID companyId, String planType,
            LocalDateTime subscriptionStartAt, LocalDateTime expiredAt, String expirationReason) {
        try {
            SubscriptionExpiredEventDTO event = SubscriptionExpiredEventDTO.builder()
                    .subscriptionId(subscriptionId)
                    .companyId(companyId)
                    .planType(planType)
                    .subscriptionStartAt(subscriptionStartAt)
                    .expiredAt(expiredAt)
                    .expirationReason(expirationReason)
                    .eventTimestamp(LocalDateTime.now())
                    .eventSource("subscription-service")
                    .build();
            log.debug("Built SubscriptionExpiredEvent: {}", event);
            return event;
        } catch (Exception e) {
            log.error("Error building SubscriptionExpiredEvent: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to build subscription expired event", e);
        }
    }

    private SubscriptionCancelledEventDTO buildSubscriptionCancelledEvent(
            UUID subscriptionId, UUID companyId, String planType,
            LocalDateTime subscriptionStartAt, LocalDateTime cancelledAt,
            LocalDateTime accessEndsAt, String cancellationReason) {
        try {
            SubscriptionCancelledEventDTO event = SubscriptionCancelledEventDTO.builder()
                    .subscriptionId(subscriptionId)
                    .companyId(companyId)
                    .planType(planType)
                    .subscriptionStartAt(subscriptionStartAt)
                    .cancelledAt(cancelledAt)
                    .accessEndsAt(accessEndsAt)
                    .cancellationReason(cancellationReason)
                    .eventTimestamp(LocalDateTime.now())
                    .eventSource("subscription-service")
                    .build();
            log.debug("Built SubscriptionCancelledEvent: {}", event);
            return event;
        } catch (Exception e) {
            log.error("Error building SubscriptionCancelledEvent: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to build subscription cancelled event", e);
        }
    }

    private SubscriptionExpiringSoonEventDTO buildSubscriptionExpiringSoonEvent(
            UUID subscriptionId, UUID companyId, String planType,
            LocalDateTime expiresAt, int daysRemaining) {
        try {
            SubscriptionExpiringSoonEventDTO event = SubscriptionExpiringSoonEventDTO.builder()
                    .subscriptionId(subscriptionId)
                    .companyId(companyId)
                    .planType(planType)
                    .expiresAt(expiresAt)
                    .daysRemaining(daysRemaining)
                    .eventTimestamp(LocalDateTime.now())
                    .eventSource("subscription-service")
                    .build();
            log.debug("Built SubscriptionExpiringSoonEvent: {}", event);
            return event;
        } catch (Exception e) {
            log.error("Error building SubscriptionExpiringSoonEvent: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to build subscription expiring soon event", e);
        }
    }

    // ==================== Error Handling Methods ====================

    private void handlePublishFailure(String topic, UUID companyId, Throwable ex) {
        log.error("Kafka publish failure - Topic: {}, CompanyId: {}, Error: {}",
            topic, companyId, ex.getMessage());

        // Log detailed error information
        if (ex.getCause() != null) {
            log.error("Root cause: {}", ex.getCause().getMessage());
        }

        // Check for specific error types
        if (ex instanceof org.springframework.kafka.KafkaException) {
            log.error("Kafka-specific error occurred. Check Kafka broker connectivity and configuration.");
        } else if (ex instanceof java.util.concurrent.TimeoutException) {
            log.error("Timeout occurred while publishing to Kafka. Check broker responsiveness.");
        } else if (ex instanceof java.io.IOException) {
            log.error("I/O error occurred. Check network connectivity to Kafka broker.");
        }

        // Log recommendation for retry
        log.warn("Event publishing failed. The application will not automatically retry. " +
            "Consider implementing a dead letter queue or manual retry mechanism.");
    }

    // DTOs for Kafka events
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class SubscriptionCreatedEventDTO {
        private UUID subscriptionId;
        private UUID companyId;
        private String planType;
        private LocalDateTime startAt;
        private LocalDateTime endAt;
        private String paymentReferenceId;
        private LocalDateTime eventTimestamp;
        private String eventSource;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class SubscriptionRenewedEventDTO {
        private UUID subscriptionId;
        private UUID companyId;
        private String planType;
        private LocalDateTime previousEndAt;
        private LocalDateTime newEndAt;
        private String paymentReferenceId;
        private Double renewalAmount;
        private String currency;
        private LocalDateTime renewalTimestamp;
        private LocalDateTime eventTimestamp;
        private String eventSource;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class SubscriptionExpiredEventDTO {
        private UUID subscriptionId;
        private UUID companyId;
        private String planType;
        private LocalDateTime subscriptionStartAt;
        private LocalDateTime expiredAt;
        private String expirationReason;
        private LocalDateTime eventTimestamp;
        private String eventSource;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class SubscriptionCancelledEventDTO {
        private UUID subscriptionId;
        private UUID companyId;
        private String planType;
        private LocalDateTime subscriptionStartAt;
        private LocalDateTime cancelledAt;
        private LocalDateTime accessEndsAt;
        private String cancellationReason;
        private LocalDateTime eventTimestamp;
        private String eventSource;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class SubscriptionExpiringSoonEventDTO {
        private UUID subscriptionId;
        private UUID companyId;
        private String planType;
        private LocalDateTime expiresAt;
        private int daysRemaining;
        private LocalDateTime eventTimestamp;
        private String eventSource;
    }
}
